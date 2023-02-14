import {Hardware} from "./Hardware"
import { Memory } from "./Memory"
import { Cpu } from "./Cpu"

export class Mmu extends Hardware {

    private memory : Memory;
    private address = 0x0000

    constructor(mem : Memory) {
        super(0 , "MMU")
        this.memory = mem
    }

    /*
        tells Memory to read data
     */
    public doRead() {
        this.memory.read()
    }

    /*
        tells memory to write data
     */
    public doWrite() {
        this.memory.write()
    }

    /*
        used as a way to hard code in and load programs without an OS
     */
    public writeImmediate(address : number , instruction : number) {
        //let program : number[] = [0xA9 , 0x0D , 0xA9 , 0x1D , 0xA9 , 0x2D , 0xA9 , 0x3F , 0xA9 , 0xFF , 0x00]
        this.memory.setMAR(address)
        this.memory.setMDR(instruction)
        this.memory.write()
    }

    /*
        store low order byte
     */
    public setLowOrderByte(lo : number) {
        this.address = lo
    }

    /*
        add the high order byte and properly format memory address
     */
    public setHighOrderByte(hi : number) {
        this.address += (hi * 0x100)
    }

    //getters / setters
    //----------------------------------------

    public setAddress(addy : number) {
        this.address = addy
    }

    public getMDR(){
        return this.memory.getMDR()
    }

    public setMDR(data : number){
        this.memory.setMDR(data)
    }

    public setMAR(addy : number) {
        this.memory.setMAR(addy)
    }

    public getMAR(){
        return this.memory.getMAR()
    }

    public getAddress(){
        return this.address
    }
}