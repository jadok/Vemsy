import { join } from 'path'

import { IStyleCompiler } from './style'

import { SassStyle } from './sassStyle'

export class StyleManager {
  public compiler: IStyleCompiler[] = []
  public themePath: string = ''
  public publicPath: string = ''

  constructor(themePath: string, publicPath: string) {
    this.themePath = themePath
    this.publicPath = publicPath
    this.setCompilers()
  }

  public setCompilers() {
    this.compiler.push(new SassStyle())
  }

  /**
   * Compile the filename with all the compiler matching the file.
   *
   * @param filename
   *  filename to be compiled.
   */
  public compile(filename: string) {
    const fileDirs = filename.split('/')
    const srcTheme: string = join(this.themePath, ...fileDirs.slice(0, fileDirs.length - 1))
    this.compiler
      .reduce((acc: IStyleCompiler[], curr: IStyleCompiler) => {
        if (curr.matchExtension(filename)) {
          return [curr]
        }
        return acc
      }, [])
      .forEach((compiler: IStyleCompiler) =>
        compiler.compile(fileDirs, srcTheme, this.publicPath))
  }

  public resolver(filename: string) {
    return this.compiler
      .reduce((acc: string, curr: IStyleCompiler) => {
        if (curr.matchExtension(filename)) {
          return curr.resolver(filename)
        }
        return acc
      }, '')
  }
}