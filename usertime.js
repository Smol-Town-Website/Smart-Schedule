function freetimes(events, startimes, endtimes) {
  const availablestartimes = [];
  const availablendtimes = [];
  
  availablestartimes.push('0:00',startimes[0]);
  availablendtimes.push('0:00',endtimes[0]);
  
  console.log(availablestartimes);
}

freetimes()