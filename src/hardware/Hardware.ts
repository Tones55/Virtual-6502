export class Hardware {

    public idNum : number
    public name : String
    public debug : boolean = true
    public time : number = new Date().getTime()

    constructor(hardwareID : number , hardwareName : String){
        this.idNum = hardwareID
        this.name = hardwareName
    }

    /*
        convert a decimal number to hex with proper padding
     */
    public hexLog(num: number , len: number): string {
        let outNum : string = num.toString(16)
        let diff : number = len - outNum.length

        outNum = ""
        for(let i=0; i<diff; i++){
            outNum += '0'
        }
        outNum += num.toString(16)
        return outNum.toUpperCase()
    }

    /*
        convert a hex number to 2s complement
     */
    public hexTo2sComplement(hexNum : number){
        if(hexNum > 0x7F){
            return hexNum - 0x100
        }
        else{
            return hexNum
        }
    }

    /*
        print a message from a specific hardware component
     */
    public log(msg : string) : void{
        if(this.debug == true){
            this.updateTime()
            console.log("[HW - " + this.name + " id: " + this.idNum + " - " + this.time + "]: " + msg)
        }
    }

    /*
        newline method to only be invoked when debugging is true
     */
    public logSpacer(){
        if(this.debug == true){
            console.log()
        }
    }

    /*
        update the time for logs
     */
    private updateTime() {
        this.time = new Date().getTime()
    }
}