import {Hardware} from "./Hardware"
import { ClockListener } from "./imp/ClockListener";

export class Memory extends Hardware implements ClockListener{

    private memory = new Array<number>(0xFFFF)
    private MAR = 0x0000
    private MDR = 0x00

    constructor(){
        super(0 , "Memory")
        this.memory.fill(0x00 , 0x0000 , 0xFFFF)
    }

    /*
        pulse method that initiates a clock cycle
     */
    public pulse() : void {
        //this.log("received clock pulse")
        this.log("MAR:" + this.hexLog(this.MAR , 4) + " MDR:" + this.hexLog(this.MDR , 2))
    }

    /*
        prints out a message that displays the contents of the requested memory locations
     */
    public displayMemory(begin : number , end : number) {
        this.logSpacer()
        this.log("Memory Dump: Debug")
        this.log("---------------------------------------------")

        if(begin < 0x0000 || begin > end){
            this.log("Address : " + begin + " Contains Value: ERR " +
             parseInt(begin.toString() , 16) + ": number undefined")
        }else if(end > 0xFFFF || end < begin){
            this.log("Address : " + end + " Contains Value: ERR " +
             parseInt(end.toString() , 16) + ": number undefined")
        }
        else{
            for(let i=begin; i<=end; i++) {
                this.log("Memory Address " + this.hexLog(i , 4) + " - Contains: " + this.hexLog(this.memory[i] , 2))
            }
        }
        this.log("---------------------------------------------")
        this.log("Memory Dump: Complete")
        this.logSpacer()
    }

    /*
       reset memory, MDR, and MAR to 0s
     */
    public reset() {
        this.memory.fill(0x00 , 0x0000 , 0xFFFF)
        this.MDR = 0x00
        this.MAR = 0x0000
    }

    /*
        read from memory at location in MAR
     */
    public read() {
        this.MDR = this.memory[this.MAR]
    }

    /*
        write to memory in location stored in MAR
     */
    public write() {
        this.memory[this.MAR] = this.MDR
    }

    //getters / setters
    //-----------------------------------------

    public getMemory() {
        return this.memory
    }

    public getMDR() {
        return this.MDR
    }

    public getMAR() {
        return this.MAR
    }

    public setMDR(data : number) {
        this.MDR = data
    }

    public setMAR(address : number) {
        this.MAR = address
    }
}