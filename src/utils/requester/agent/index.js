import httpAgent from './http-agent'
import httpsAgent from './https-agent'

function CreateHttpProxyAgent(opts) {
	return new httpAgent(opts);
}
CreateHttpProxyAgent.HttpProxyAgent = httpAgent;
CreateHttpProxyAgent.prototype = httpAgent.prototype;

function CreateHttpsProxyAgent(opts) {
	return new httpsAgent(opts);
}
CreateHttpsProxyAgent.HttpsProxyAgent = httpsAgent;
CreateHttpsProxyAgent.prototype = httpsAgent.prototype;

export default (protocol, opts)=>{
	if(protocol === 'http') return CreateHttpProxyAgent(opts)
	return CreateHttpsProxyAgent(opts)
}

