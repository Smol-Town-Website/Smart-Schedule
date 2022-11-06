//an unused algorithm to calculate the time available for friends within an event
//fake data to test a case
const eventstart = new Date('2022-11-05T12:46:00.000Z');
const eventend = new Date('2022-11-05T18:15:00.000Z');

const start1 = new Date('2022-11-05T13:40:00.000Z');
const start2 = new Date('2022-11-05T13:20:00.000Z');
const end1 = new Date('2022-11-05T14:35:00.000Z');
const end2 = new Date('2022-11-05T15:20:00.000Z');


const avstart = [start1, start2];
const avend = [end1, end2];

//running the smart scheduling function
smartsched(eventstart, eventend, avstart, avend);

function smartsched(eventstart, eventend, availablestartimes, availablendtimes){
    
    const friendavstart = [];
	const friendavend = [];

    for(y = 0; y <= availablestartimes.length-1; ++y){

        if(availablestartimes[y].getTime() >= eventstart.getTime() && availablestartimes[y].getTime() <= eventend.getTime()){
            friendavstart.push(availablestartimes[y]);
        }
        
        if(availablendtimes[y].getTime() >= eventstart.getTime() && availablendtimes[y].getTime() <= eventend.getTime()){
            friendavend.push(availablendtimes[y]);
        }
    }
    
    const startframe = new Date(Math.max(...friendavstart));
    const endframe = new Date(Math.min(...friendavend));
    
    console.log('start:'+startframe);
    console.log('end:' +endframe);
    
    
}

