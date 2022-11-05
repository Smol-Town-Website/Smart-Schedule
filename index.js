const express = require('express')
var app = express()
const fs = require('fs')
const users = JSON.parse(fs.readFileSync(__dirname + '/users.json'))
const friendships = JSON.parse(fs.readFileSync(__dirname + '/friendships.json'))

app.get('/api/*', async (req, res) => {
  if (req.path.startsWith('/api/users/')) {
    parts = req.path.split('/').slice(3)
    console.log(parts)
    func = parts[0]
    if (func == 'get') {
      if (!(Number(parts[1]))) return
      founduser = users.find(u => u.id == Number(parts[1]))
      if (!founduser) return
      res.send(founduser)
    }
    if (func == 'addfriend') {
      if (!(Number(parts[1]))) return
      id1 = Number(parts[1])
      if (!Number(req.query['target'])) return
      id2 = Number(req.query['target'])
      friendships.push([id1, id2])
      fs.writeFile(__dirname + '/friendships.json', JSON.stringify(friendships, null, 2), (err) => {if (err) console.log(err)})
      filtered = friendships.filter(friendship => friendship.includes(id1))
      res.send({confirmation: true, newfriends: filtered})
    }
    if (func == 'friends') {
      if (!(Number(parts[1]))) return
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
})

app.get('/*', async (req, res) => {
  if (req.path == '/') req.path = '/index.html'
  res.sendFile(__dirname + '/main' + req.path)
})

app.listen(80, () => {console.log('online')})
