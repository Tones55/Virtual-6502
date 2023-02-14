import {Hardware} from "./Hardware";
import {Interrupt} from "./imp/Interrupt";
import {Keyboard} from "./Keyboard";

export class InterruptController extends Hardware{

    private interruptGeneratingHardware : Interrupt[]
    private interruptsGenerated : Interrupt[]

    constructor(keyboard : Keyboard){
        super(0 , "Interrupt Controller")
        this.interruptGeneratingHardware = [keyboard]
    }

    /*
        generate an interrupt
     */
    public generateInterrupt(interrupt : Interrupt){
        this.interruptsGenerated.push(interrupt)
    }

    /*
        remove the interrupt from interruptsGenerated after they have been executed
     */
    private completeInterrupt(index : number){
        this.interruptsGenerated.splice(index)
    }

    /*
        checks if there is an interrupt waiting and return a boolean value
     */
    public checkForInterrupts() : boolean{
        if(this.interruptsGenerated.length == 0){
            return true
        }
        else{
            return false
        }
    }

    /*
        find the highest priority interrupt and return the index
     */
    private getNextInterrupt() : number{
        let nextInterrupt = this.interruptsGenerated[0].priority
        for(let i=1; i<this.interruptsGenerated.length; i++){
            if(this.interruptsGenerated[i].priority < nextInterrupt){
                nextInterrupt = i
            }
        }
        return nextInterrupt
    }

    /*
        execute the highest priority interrupt
     */
    private executeInterrupt(){
        
    }
}
