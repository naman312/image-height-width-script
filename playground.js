#!/usr/bin/node
const k2 = ()=>{
    let i = 0;
    while(i<1000000000){
        i++
    }
    return 
}



const fn =async ()=>{
    console.log('fn start ')
 await k2();
console.log('fn end ')

}


for(let i =0;i<6;i++){
    fn();
}