import VmCode from "./vmCode";

export default function (code, obj){
	return new VmCode(code, obj)
}
