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
      invited.forEach((invitedUserId) => {
        userlist.push({
          id: invitedUserId,
          acceptance: false,
          notes: "invited"
        })
      })
      events.push({
        users: userlist,
        id: events.length-1,
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
    }
    if (func == 'confirm') {
      eventId = parts[1]
      start = req.query.start
      finish = 
    }
  }
})

app.get('/*', async (req, res) => {
  if (req.path == '/') req.path = '/index.html'
  res.sendFile(__dirname + '/main' + req.path)
})

app.listen(80, () => {console.log('online')})
