import {Hardware} from "./Hardware"
import {ClockListener} from "./imp/ClockListener"
import {Mmu} from "./Mmu"
import {System} from "../System";
import {Ascii} from "../Ascii";

export class Cpu extends Hardware implements ClockListener{

    private MMU : Mmu = null
    private cpuClockCount : number
    private programCounter : number
    private accumulator : number
    private instructionRegister : number
    private xRegister : number
    private yRegister : number
    private zFlag : number
    private nextStep : string
    private resumePC : number //this will hold the value in the PC when a string is printed so it can be restored

    constructor(mmu : Mmu) {
        super(0 , "CPU")
        this.MMU = mmu
        this.cpuClockCount = 0
        this.programCounter = 0x0000
        this.accumulator = 0x00
        this.instructionRegister = 0x00
        this.xRegister = 0x00
        this.yRegister = 0x00
        this.zFlag = 0
        this.nextStep = "fetch"
    }

    /*
        pulse method that initiates a clock cycle
     */
    pulse(){
        //
        this.cpuClockCount++
        //this.log("received clock pulse - CPU clock count: " + this.cpuClockCount)
        this.log("PC:" + this.hexLog(this.programCounter , 4) + " IR:" + this.hexLog(this.instructionRegister , 2)
            + " Acc:" + this.hexLog(this.accumulator , 2) + " X:" + this.hexLog(this.xRegister , 2)
            + " Y:" + this.hexLog(this.yRegister , 2) + " Z:" + this.zFlag)
        this.logSpacer()

        switch(this.nextStep){
            case "fetch":
                this.fetch()
                break
            case "decode":
                this.decode()
                break
            case "execute":
                this.execute()
                break
            case "write back":
                this.writeBack()
                break
            case "interrupt check":
                this.interruptCheck()
                break
            default:
                this.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                this.log("Okay, if this happens then it is my fault and I take 100% responsibility")
                this.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                process.exit(1)
        }
    }

    /*
        go to the program counter in memory and put the op code in the instruction register
     */
    private fetch(){
        this.log("----- Fetching next instruction -----")
        this.readAndIncrement()
        this.instructionRegister = this.MMU.getMDR()
        this.nextStep = "decode"
    }

    /*
        decipher the next step and continue processing
     */
    private decode(){
        this.log("----- decoding instruction -----")
        if(this.instructionRegister == 0xEA || this.instructionRegister == 0x00){ //no operands for op code
            this.nextStep = "execute"
        }
        else if(this.instructionRegister == 0xA9 || this.instructionRegister == 0xA2
            || this.instructionRegister == 0xA0 || this.instructionRegister == 0xD0){ //single operand
            this.readAndIncrement()
            this.nextStep = "execute"
        }
        else if(this.instructionRegister == 0xAD || this.instructionRegister == 0x8D
            || this.instructionRegister == 0x6D || this.instructionRegister == 0xAE
            || this.instructionRegister == 0xAC || this.instructionRegister == 0xEC
            || this.instructionRegister == 0xEE){ //2 operands

            this.handleLittleEndian()
        }
        else if(this.instructionRegister == 0xFF){
            if(this.xRegister == 0x03){
                this.handleLittleEndian()
            }
            else{
                this.nextStep = "execute"
            }
        }
        else{ //invalid op code for 6502 instruction set
            this.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            this.log("This has to be user error because otherwise it is my fault and I don't like that")
            this.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            process.exit(1)
        }
    }

    /*
        execute the instruction
     */
    private execute(){
        this.log("----- executing instruction -----")
        switch(this.instructionRegister){
            case 0xA9:
                this.loadConstant()
                break
            case 0xAD:
                this.LoadFromMemory()
                break
            case 0x8D:
                this.storeInMemory()
                break
            case 0x8A:
                this.loadFromX()
                break
            case 0x98:
                this.loadFromY()
                break
            case 0x6D:
                this.add()
                break
            case 0xA2:
                this.loadXWithConstant()
                break
            case 0xAE:
                this.loadXFromMemory()
                break
            case 0xAA:
                this.loadXFromAccumulator()
                break
            case 0xA0:
                this.loadYWithConstant()
                break
            case 0xAC:
                this.loadYFromMemory()
                break
            case 0xA8:
                this.loadYFromAccumulator()
                break
            case 0xEA:
                this.doNothing()
                break
            case 0x00:
                this.break()
                break
            case 0xEC:
                this.compare()
                break
            case 0xD0:
                this.branch()
                break
            case 0xEE:
                this.incrementByte()
                break
            case 0xFF:
                this.systemCalls()
                break
            default:
                //invalid instruction got through
                this.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                this.log("This one is still not my fault. IDK what is wrong with you users")
                this.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                process.exit(1)
        }
    }

    /*
        write the accumulator back into the used memory address
     */
    private writeBack(){
        this.log("----- writing back -----")
        this.MMU.setMDR(this.accumulator)
        this.MMU.doWrite()
        this.nextStep = "interrupt check"
    }

    /*
        check if there is an interrupt waiting
     */
    private interruptCheck(){
        this.log("----- interrupt check -----")
        //implemented in milestone 3
        this.nextStep = "fetch"
    }

    /*
        read the next byte in memory and increment the program counter
     */
    private readAndIncrement(){
        this.MMU.setMAR(this.programCounter)
        this.MMU.doRead()
        this.programCounter++
    }

    /////////////////////////
    //Start Instruction Set//
    /////////////////////////

    /*
        A9 LDA - Load the accumulator with a constant
     */
    private loadConstant(){
        this.MMU.doRead()
        this.accumulator = this.MMU.getMDR()
        this.nextStep = "interrupt check"
    }

    /*
        AD LDA - Load the accumulator from memory
     */
    private LoadFromMemory(){
        this.MMU.doRead()
        this.accumulator = this.MMU.getMDR()
        this.nextStep = "interrupt check"
    }

    /*
        8D STA - Store the accumulator in memory
     */
    private storeInMemory(){
        this.MMU.setMDR(this.accumulator)
        this.MMU.doWrite()
        this.nextStep = "interrupt check"
    }

    /*
        8A TXA - Loads the accumulator from the X register
     */
    private loadFromX(){
        this.accumulator = this.xRegister
        this.nextStep = "interrupt check"
    }

    /*
        98 TYA - Loads the accumulator rom the Y register
     */
    private loadFromY(){
        this.accumulator = this.yRegister
        this.nextStep = "interrupt check"
    }

    /*
        6D ADC - Add with carry
     */
    private add(){
        this.MMU.doRead()
        this.accumulator += this.MMU.getMDR()
        this.nextStep = "interrupt check"
    }

    /*
        A2 LDX - Load the X register with a constant
     */
    private loadXWithConstant(){
        this.MMU.doRead()
        this.xRegister = this.MMU.getMDR()
        this.nextStep = "interrupt check"
    }

    /*
        AE LDX - Load the X register from memory
     */
    private loadXFromMemory(){
        this.MMU.doRead()
        this.xRegister = this.MMU.getMDR()
        this.nextStep = "interrupt check"
    }

    /*
        AA TAX - Loads the X register from the accumulator
     */
    private loadXFromAccumulator(){
        this.xRegister = this.accumulator
        this.nextStep = "interrupt check"
    }

    /*
        A0 LDY - Load the Y register with a constant
     */
    private loadYWithConstant(){
        this.MMU.doRead()
        this.yRegister = this.MMU.getMDR()
        this.nextStep = "interrupt check"
    }

    /*
        AC LDY - Load the y register from memory
     */
    private loadYFromMemory(){
        this.MMU.doRead()
        this.yRegister = this.MMU.getMDR()
        this.nextStep = "interrupt check"
    }

    /*
        A8 TAY - Loads the Y register from the accumulator
     */
    private loadYFromAccumulator(){
        this.yRegister = this.accumulator
        this.nextStep = "interrupt check"
    }

    /*
        EA NOP - No Operation
     */
    private doNothing(){
        //Do Nothing
        this.nextStep = "interrupt check"
    }

    /*
        00 BRK - Break (End of program system call)
     */
    private break(){
        process.exit(0)
    }

    /*
        EC CPX - Compare a byte in memory to the X register and set z flag if equal
     */
    private compare(){
        if(this.xRegister == this.accumulator){
            this.zFlag = 1
        }
        this.nextStep = "interrupt check"
    }

    /*
        D0 BNE - Branch (n) bytes if Z flag = 0
     */
    private branch(){
        if(this.zFlag == 0){
            this.MMU.setMAR(this.MMU.getMAR() + this.hexTo2sComplement(this.MMU.getMDR()) + 1)
            this.programCounter = this.MMU.getMAR()
        }
        else{
            this.programCounter += 2
            this.zFlag = 0
        }
        this.nextStep = "interrupt check"
    }

    /*
        EE INC - Increment the value of a byte
     */
    private incrementByte(){
        if(this.MMU.getMDR() == this.accumulator){
            this.accumulator++
            this.nextStep = "write back"
        }
        else{
            this.accumulator = this.MMU.getMDR()
        }
    }

    /*
        FF SYS - System calls
     */
    private systemCalls(){
        if(this.xRegister == 0x01){
            process.stdout.write(this.yRegister + " ")
            this.log("")
            this.nextStep = "interrupt check"
        }
        else if(this.xRegister == 0x02){
            //nothing for now
            //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            this.nextStep = "interrupt check"
        }
        else if(this.xRegister == 0x03){
            if(this.resumePC == null){
                this.resumePC = this.programCounter
            }
            this.programCounter = this.MMU.getMAR()
            if(this.printString()){
                this.programCounter = this.resumePC
                this.resumePC = null
                this.nextStep = "interrupt check"
            }
        }
        else{
            //do nothing X register did not have a proper value for a system call
        }
    }

    /*
        used to print a string in memory
     */
    private printString() : boolean{
        this.readAndIncrement()
        if(this.MMU.getMDR() != 0x00){
            process.stdout.write(Ascii.toChar(this.MMU.getMDR()))
            //console.log("\n##### " + Ascii.toChar(this.MMU.getMDR()) + " #####\n")
            this.readAndIncrement()
            return false
        }
        else{
            return true
        }

    }

    /*
        if an address needs to be fetched from memory handle the little endian format
     */
    private handleLittleEndian(){
        if(this.MMU.getMDR() != this.instructionRegister){ //if the low order byte was set last then set the high order byte
            this.readAndIncrement()
            this.MMU.setHighOrderByte(this.MMU.getMDR())
            this.MMU.setMAR(this.MMU.getAddress())
            this.MMU.doRead()
            this.nextStep = "execute"
        }
        else{ //if the op code was grabbed last then set the low order byte
            this.readAndIncrement()
            this.MMU.setLowOrderByte(this.MMU.getMDR())
        }
    }
}
