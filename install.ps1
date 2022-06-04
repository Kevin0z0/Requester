#[configration]
$x = Split-Path -Parent $MyInvocation.MyCommand.Definition
$basePath = "$($x)\node_modules\electron"
$version = "13.4.0"

if(!(Test-Path "$($basePath)")){
    npm install
}

if(Test-Path "$($basePath)\dist"){
    exit
}

#[download package]
Invoke-WebRequest "https://npm.taobao.org/mirrors/electron/$($version)/electron-v$($version)-win32-x64.zip" -OutFile "$($basePath)\electron.zip"
#[extract file]
Expand-Archive -Path "$($basePath)\electron.zip" -DestinationPath "$($basePath)\dist"
#[add path.txt]
"electron.exe" | Out-File "$($basePath)\path.txt" -NoNewline
Remove-Item "$($basePath)\electron.zip"