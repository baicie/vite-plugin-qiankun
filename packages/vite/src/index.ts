import type { CheerioAPI, Element } from 'cheerio'
import { load } from 'cheerio'
import type { Plugin, PluginOption } from 'vite'

function createQiankunHelper (qiankunName: string) {
  return `
  const createDeffer = (hookName) => {
    const d = new Promise((resolve, reject) => {
      window.proxy && (window.proxy[\`vite\${hookName}\`] = resolve)
    })
    return props => d.then(fn => fn(props));
  }
  const bootstrap = createDeffer('bootstrap');
  const mount = createDeffer('mount');
  const unmount = createDeffer('unmount');
  const update = createDeffer('update');

  ;(global => {
    global.qiankunName = '${qiankunName}';
    global['${qiankunName}'] = {
      bootstrap,
      mount,
      unmount,
      update
    };
  })(window);
`
}

function createImportFinallyResolve (qiankunName: string) {
  return `
    const qiankunLifeCycle = window.moudleQiankunAppLifeCycles && window.moudleQiankunAppLifeCycles['${qiankunName}'];
    if (qiankunLifeCycle) {
      window.proxy.vitemount((props) => qiankunLifeCycle.mount(props));
      window.proxy.viteunmount((props) => qiankunLifeCycle.unmount(props));
      window.proxy.vitebootstrap(() => qiankunLifeCycle.bootstrap());
      window.proxy.viteupdate((props) => qiankunLifeCycle.update(props));
    }
  `
}

export interface MicroOption {
  useDevMode?: boolean
}

export default function htmlPlugin (qiankunName: string, microOption?: MicroOption): PluginOption[] {
  let isProduction: boolean
  let base = ''

  const module2DynamicImport = ($: CheerioAPI, scriptTag: Element | undefined) => {
    if (!scriptTag) { return }

    const script$ = $(scriptTag)
    const moduleSrc = script$.attr('src')
    let appendBase = ''
    if (microOption?.useDevMode && !isProduction) { appendBase = '(window.proxy ? (window.proxy.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + \'..\') : \'\') + ' }

    script$.removeAttr('src')
    script$.removeAttr('type')
    script$.html(`import(${appendBase}'${moduleSrc}')`)
    return script$
  }

  const qiankun: Plugin = {
    name: 'qiankun-html-transform',
    configResolved (config) {
      isProduction = config.command === 'build' || config.isProduction
      base = config.base
    },

    configureServer (server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (isProduction || !microOption?.useDevMode) {
            next()
            return
          }
          const end = res.end.bind(res)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          res.end = (...args: any[]) => {
            let [htmlStr, ...rest] = args
            if (typeof htmlStr === 'string') {
              const $ = load(htmlStr)
              module2DynamicImport($, $(`script[src=${base}@vite/client]`).get(0))
              htmlStr = $.html()
            }
            end(htmlStr, ...rest)
          }
          next()
        })
      }
    },
    transformIndexHtml (html: string) {
      const temp = load(html)
      const moduleTags = temp('head script[type=module], body script[type=module], head script[crossorigin=""]')
      if (!moduleTags || !moduleTags.length) { return }

      const len = moduleTags.length
      moduleTags.each((i, moduleTag) => {
        if (i === 0) {
          const tag = temp(moduleTag)
          tag.empty()
          tag.remove('type')
          tag.html(`
            import((window.proxy ? (window.proxy.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + '..') : '') + '/@react-refresh').then((res)=>{
              const { injectIntoGlobalHook } = res.default
              const parentWindow = window.parent;
              injectIntoGlobalHook(parentWindow)
              parentWindow.$RefreshReg$ = () => {}
              parentWindow.$RefreshSig$ = () => (type) => type
              parentWindow.__vite_plugin_react_preamble_installed__ = true
              console.log('RefreshReg',parentWindow)
            })
          `)
        } else {
          if (len - 1 === i) {
            const script$ = module2DynamicImport(temp, moduleTag)
            script$?.html(`${script$.html()}.finally(() => {
              ${createImportFinallyResolve(qiankunName)}
            })`)
          }
        }
      })

      temp('body').append(`<script>${createQiankunHelper(qiankunName)}</script>`)
      const output = temp.html()
      return output
    }
  }

  return [qiankun]
}
