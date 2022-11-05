
const express = require('express')
var app = express()
const fs = require('fs')
const users = JSON.parse(fs.readFileSync(__dirname + '/users.json'))
const events = JSON.parse(fs.readFileSync(__dirname + '/events.json'))
const friendships = JSON.parse(fs.readFileSync(__dirname + '/friendships.json'))

app.get('/api/*', async (req, res) => {
  parts = req.path.split('/').slice(3)
  func = parts[0]
  if (req.path.startsWith('/api/users/')) {
    if (func == 'get') {
      if (!(Number(parts[1]))) return
      founduser = users.find(u => u.id == Number(parts[1]))
      if (!founduser) return res.send({error: true})
      res.send(founduser)
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
    if (func == 'friends') {
      if (!(Number(parts[1]))) return res.send({error: true})
      filtered = friendships.filter(friendship => friendship.includes(Number(parts[1])))
      res.send({friends: filtered})
    }
    if (func == 'find') {
      type = parts[1]
      if (type == 'email') {
        founduser = users.find(user => user.extra.email == req.query['input'])
        if (!founduser) return res.send({error: true})
        res.send(founduser)
      }
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
      data = JSON.parse(req.headers.data)
      console.log(data)
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
      res.send({
        options: [data['possible-dates'][0]],
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
