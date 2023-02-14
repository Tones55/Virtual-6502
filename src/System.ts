import {Hardware} from "./hardware/Hardware"
import {Cpu} from "./hardware/Cpu"
import {Memory} from "./hardware/Memory"
import {Clock} from "./hardware/Clock"
import {Mmu} from "./hardware/Mmu"
import {cpus} from "os";


/*
    Constants
 */
// Initialization Parameters for Hardware
// Clock cycle interval
const CLOCK_INTERVAL = 10              // This is in ms (milliseconds) so 1000 = 1 second, 100 = 1/10 second
                                        // A setting of 100 is equivalent to 10hz, 1 would be 1,000hz or 1khz,
                                        // .001 would be 1,000,000 or 1mhz. Obviously you will want to keep this
                                        // small, I recommend a setting of 100, if you want to slow things down
                                        // make it larger.


export class System extends Hardware{

    private _CPU : Cpu = null
    private memory : Memory = null
    private clock : Clock = null
    private _MMU : Mmu = null
    
    public running: boolean = false
    static stopSystem: any

    constructor() {
        
        super(0 , "System")

        this.memory = new Memory()
        this._MMU = new Mmu(this.memory)
        this._CPU = new Cpu(this._MMU)
        this.clock = new Clock([this._CPU , this.memory] , CLOCK_INTERVAL)
        
        /*
        Start the system (Analogous to pressing the power button and having voltages flow through the components)
        When power is applied to the system clock, it begins sending pulses to all clock observing hardware
        components so they can act on each clock cycle.
         */

        this.startSystem()

    }

    public startSystem(): boolean {

        /*
        this._CPU.debug = false
        this.memory.debug = false
        this._MMU.debug = false
        this.clock.debug = false
         */

        this.log("Created")
        this._CPU.log("Created")
        this.memory.log("Created - Addressable space : " + this.memory.getMemory().length + 1)
        this._MMU.log("Created")
        this.clock.log("Created")
        this.logSpacer()

        let oneToTen : number[] = [0xA9, 0x00, 0x8D, 0x20, 0x00, 0xEE, 0x20, 0x00, 0xA2, 0x01, 0xAC, 0x20, 0x00, 0xFF,
            0xA2 , 0x0A, 0xEC, 0x20, 0x00, 0xD0, 0xF0, 0x00]
        let helloWorld : number[] = [0xA2, 0x03, 0xFF, 0x06, 0x00, 0x00, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F,
            0x72, 0x6C, 0x64, 0x21, 0x0A, 0x00]

        let program = helloWorld

        for(let i=0; i<program.length; i++) {
            this._MMU.writeImmediate(i , program[i])
            this._MMU.setMAR(0x0000)
        }

        return true
    }

    public stopSystem(): boolean {
        return false
    }
}

let system: System = new System()

/*
To Do Next:
- ASCII
    - Allocate ~100 hours to do this
- implement missing instructions
    - system Calls 0x02 & 0x03
- interrupts
    - how do interrupts work for our project?
    - is the current cpu state saved in memory and then resumed when interrupt is over?
        - if so it will consume cycles but how so and how many? will also have to know where free memory space is.
        - if not should the cpu process be "paused" and just handle the interrupt execution in InterruptController?
    - a more full explanation is needed
 */