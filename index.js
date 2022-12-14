const express = require('express')
var app = express()
const fs = require('fs')
const users = JSON.parse(fs.readFileSync(__dirname + '/users.json'))
const events = JSON.parse(fs.readFileSync(__dirname + '/events.json'))
const friendships = JSON.parse(fs.readFileSync(__dirname + '/friendships.json'))
const ical = require('node-ical')

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

app.get('/api/*', async (req, res) => {
  parts = req.path.split('/').slice(3)
  func = parts[0]
  if (req.path.startsWith('/api/users/')) {
    if (func == 'getiCal') {
    if (!Number(parts[1])) return res.send({error: true})
    founduser = users.find(user => user.id == Number(parts[1]))
    if (!founduser) return res.send({error: true})
    if (!founduser.ical) return res.send({error: true})
      ical.fromURL(founduser.ical, {}, (err, data) => {
        exportevents = []
        Object.keys(data).forEach((key) => {
          if (key !== 'vcalendar') {
            eventdata = data[key]
            exportevents.push({
              start: eventdata.start,
              end: eventdata.end,
              title: eventdata.summary
            })
          }
        })
        res.send(exportevents)
      })
    }
    if (func == 'get') {
      if (!(Number(parts[1]))) return
      founduser = users.find(u => u.id == Number(parts[1]))
      if (!founduser) return res.send({error: true})
      res.send(founduser)
    }
    if (func == 'getEvents') {
      if (!(Number(parts[1]))) return
      involvedEvents = []
      events.forEach(theevent => {
        theevent.users.forEach((eventUser) => {
          console.log(`${eventUser.id} ${Number(parts[1])} ${eventUser.id == Number(parts[1])}`)
          if (eventUser.id == Number(parts[1])) involvedEvents.push(theevent)
        })
      })
      res.send(involvedEvents)
    }
    if (func == 'addfriend') {
      if (!(Number(parts[1]))) return res.send({error: true})
      id1 = Number(parts[1])
      if (!Number(req.query['target'])) return
      id2 = Number(req.query['target'])
      friendships.push([id1, id2])
      fs.writeFile(__dirname + '/friendships.json', JSON.stringify(friendships, null, 2), (err) => {if (err) console.log(err)})
      filtered = friendships.filter(friendship => friendship.includes(id1))
      res.send({confirmation: true, newfriends: filtered})
    }
    if (func == 'set_avail') {
      if (!Number(parts[1])) return
      users.find(u => u.id == parts[1]).standard[req.query['day']] = {
        "open_window": req.query.ow,
        "close_window": req.query.cw,
        "open_prefer": req.query.op,
        "close_prefer": req.query.cp
      }
      fs.writeFile(__dirname + '/users.json', JSON.stringify(users, null, 2), (err) => {if (err) throw err;})
    }
    if (func == 'friends') {
      if (!(Number(parts[1]))) return res.send({error: true})
      filtered = friendships.filter(friendship => friendship.includes(Number(parts[1])))
      var friends = []
      filtered.forEach((friendship) => {
        console.log(`Removing ${Number(parts[1])} from ${friendship} results in ${removeItemOnce(friendship, Number(parts[1]))}.`)
        friends.push(removeItemOnce(friendship, Number(parts[1])))
      })
      var loadedfriends = []
      console.log(friends)
      friends.forEach((friend) => {
        loadedfriends.push(users.find(u => u.id == friend))
      })
      res.send({friends: loadedfriends})
    }
    if (func == 'find') {
      type = parts[1]
      if (type == 'email') {
        founduser = users.find(user => user.extra.email == req.query['input'])
        if (!founduser) return res.send({error: true})
        res.send(founduser)
      }
    }
    if (func == 'allUsers') {
      res.send(users)
    }
    if (func == 'register') {
      first = req.query.first
      middle = req.query.middle
      last = req.query.last
      email = req.query.email
      standard = {
        "monday": {"open_window": req.query['monday-open'], "open_close": req.query['monday-close'], "open_prefer": req.query['monday-open-prefer'], "close_prefer": req.query['monday-close-prefer']},
        "tuesday": {"open_window": req.query['tuesday-open'], "open_close": req.query['tuesday-close'], "open_prefer": req.query['tuesday-open-prefer'], "close_prefer": req.query['tuesday-close-prefer']},
        "wednesday": {"open_window": req.query['wednesday-open'], "open_close": req.query['wednesday-close'], "open_prefer": req.query['wednesday-open-prefer'], "close_prefer": req.query['wednesday-close-prefer']},
        "thursday": {"open_window": req.query['thursday-open'], "open_close": req.query['thursday-close'], "open_prefer": req.query['thursday-open-prefer'], "close_prefer": req.query['thursday-close-prefer']},
        "friday": {"open_window": req.query['friday-open'], "open_close": req.query['friday-close'], "open_prefer": req.query['friday-open-prefer'], "close_prefer": req.query['friday-close-prefer']},
        "saturday": {"open_window": req.query['saturday-open'], "open_close": req.query['saturday-close'], "open_prefer": req.query['saturday-open-prefer'], "close_prefer": req.query['saturday-close-prefer']},
        "sunday": {"open_window": req.query['sunday-open'], "open_close": req.query['sunday-close'], "open_prefer": req.query['sunday-open-prefer'], "close_prefer": req.query['sunday-close-prefer']}
      }
      users.push({
        id: users.length+1,
        first: first,
        middle: middle,
        last: last,
        email: email,
        standard: standard
      })
      fs.writeFile(__dirname + '/users.json', JSON.stringify(users, null, 2), (err) => {if (err) throw err;})
      res.send(users[users.length-1])
    }
  }
  if (req.path.startsWith('/api/events/')) {
    if (func == 'get') {
      if (!Number(parts[1])) return res.send({error: true})
      event = events.find(event => event.id == Number(parts[1]))
      if (!event) return res.send({error: true})
      res.send(event)
    }
    if (func == 'invite') {
      if (!Number(parts[1])) return res.send({error: true})
      if (!Number(req.query.sending_to)) return res.send({error: true})
      if (!Number(req.query.event_id)) return res.send({error: true})
      sender = Number(parts[1])
      sending_to = Number(req.query.sending_to)
      event_id = Number(req.query.event_id)
      event = events.find(event => event.id == event_id)
      event.users.push({id: sending_to, acceptance: false})
      fs.writeFile(__dirname + '/events.json', JSON.stringify(events, null, 2), (err) => {if (err) throw err;})
    }
    if (func == 'new') {
      data = JSON.parse(req.query.data)
      
      userlist = [{
        id: Number(parts[1]),
        acceptance: true,
        notes: "host"
      }]
      data.invited.forEach((invitedUserId) => {
        userlist.push({
          id: invitedUserId,
          acceptance: false,
          notes: "invited"
        })
      })
      events.push({
        users: userlist,
        id: events.length+1,
        info: {
          name: data.name,
          description: data.description,
          location: data.location
        },
        time: {confirmed: false}
      })
      newEventId = events.length

      console.log(data['possible-dates'])

      windows = {} /* start, denial */
      data['possible-dates'].forEach((possibledate) => {
        start = new Date(possibledate.start)
        finish = new Date(possibledate.finish)
        increments = (finish-start)/1000/60/15
        for (i = 0; i < increments; i ++ ) {
          prevconsec = true
          if (i==0) prevconsec = false
          windows[start] = {denial: 0, prevConsecutive: prevconsec}
          start.setMinutes(start.getMinutes()+15)
        }
        console.log(windows)
      })
      
      returnedOptions = []

      data.invited.forEach((invitedUserId) => {
      userEvents = []
      events.forEach(theevent => {
        theevent.users.forEach((eventUser) => {
          if (eventUser.id == invitedUserId && theevent.time.confirmed == true) userEvents.push(theevent.time)
        })
      })
      
      userEvents.forEach((userEvent) => {
        eventStart = new Date(userEvent.start)
        eventFinish = new Date(userEvent.finish)
        increments = (eventFinish-eventStart)/1000/60/15
        for (i = 0; i < increments; i++) {
          Object.keys(windows).forEach((window) => {
            if (Math.abs(eventStart-new Date(window)) <= 15) windows[window].denial += 1
          })
          eventStart.setMinutes(eventStart.getMinutes()+15)
        }
      })
        console.log(windows)
      })

      lengthincrements = Math.round(data.length/15)
      console.log(lengthincrements)
      startratings = {}
      for (i=0; i < Object.keys(windows).length; i++) {
        for (x=0; x < lengthincrements; x ++) {
          totaldenial = 0
          if (!Object.keys(windows)[i+x]) break;
          console.log(`${JSON.stringify(windows[Object.keys(windows)[i+x]])}`)
          if (x>0 && windows[Object.keys(windows)[i+x]].prevConsecutive == false) break;
          totaldenial += windows[Object.keys(windows)[i+x]].denial
          
        }
        if (x == lengthincrements-1) startratings[i] = {denial: totaldenial, start: Object.keys(windows)[i-1], finish: Object.keys(windows)[i+lengthincrements-2]}
      }
      startarray = []
      Object.keys(startratings).forEach((key) => {
        startarray.push({
          id: key,
          denial: startratings[key].denial,
          start: startratings[key].start,
          finish: startratings[key].finish
        })
      })
      startarray = startarray.sort((a, b) => {
        return a.denial-b.denial
      })
      startarray = startarray.slice(0, startarray.length<4?startarray.length:4)

      startarray.forEach((option) => {
        returnedOptions.push({
          start: option.start,
          finish: option.finish
        })
      })
      
      res.send({
        options: returnedOptions,
        id: newEventId
      })
      fs.writeFile(__dirname + '/events.json', JSON.stringify(events, null, 2), (err) => {if (err) throw err;})
    }
    if (func == 'confirm') {
      eventId = parts[1]
      start = req.query.start
      finish = req.query.finish
      events.find(theevent => theevent.id == eventId).time = {
        confirmed: true,
        start: start,
        finish: finish
      }
      fs.writeFile(__dirname + '/events.json', JSON.stringify(events, null, 2), (err) => {if (err) throw err;})
    }
  }
})

app.get('/*', async (req, res) => {
  if (req.path == '/') req.path = '/index.html'
  res.sendFile(__dirname + '/main' + req.path)
})

app.listen(80, () => {console.log('online')})