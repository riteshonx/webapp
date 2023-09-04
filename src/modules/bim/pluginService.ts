import { Component } from "react";
import { pluginLoader } from "./container/utils"

class PluginsService {

  plugins: any;
  loadPlugin: any;

  constructor() {
    this.plugins = {}
    this.loadPlugin = null;
  }

  setUrl(baseUrl: any){
    this.loadPlugin = pluginLoader(baseUrl)
  }

  instantinate(name: any, module: any, options: any) {
      return this.loadPlugin(name).then((constructor: any) => (this.plugins[name] = new constructor(module, options)) && this.plugins[name])
  }

  getPluginInstance(name: any) {
    return this.plugins[name]
  }
}
const service = new PluginsService()

export default service;