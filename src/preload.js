import * as electron from "electron";
import fs from 'fs'
import path from 'path'

// const isDev = process.env.NODE_ENV === "development"
const appData = electron.app.getPath('userData');
const sqlFile = 'requester.sqlite'
const packedPath = path.join(__dirname, '../')
const plugins = 'plugins'


function dirCopy(prePath, nextPath){
    !fs.existsSync(path.join(appData, plugins)) && fs.mkdirSync(nextPath)
    const files = fs.readdirSync(prePath)
    for(const file of files){
        let dirPath = path.resolve(prePath,file)
        let flag = fs.statSync(dirPath)
        if(flag.isFile()){
            fs.copyFileSync(dirPath,path.resolve(nextPath,file))
        }else if(flag.isDirectory()){
            fs.mkdirSync(path.resolve(nextPath,file))
            dirCopy(path.resolve(prePath,file),path.resolve(nextPath,file))
        }
    }
}

function copy(prePath,nextPath){
    const flag = fs.statSync(prePath)
    if(flag.isFile()){
        return fs.copyFileSync(prePath, nextPath);
    }
    dirCopy(prePath, nextPath)
}

if(!fs.existsSync(path.join(appData, sqlFile))){
    copy(path.join(packedPath, sqlFile), path.join(appData, sqlFile))
}

if(!fs.existsSync(path.join(appData, plugins))){
    copy(path.join(packedPath, plugins), path.join(appData, plugins))
}