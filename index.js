const express = require('express')
var app = express()
const fs = require('fs')
const users = JSON.parse(fs.readFileSync(__dirname + '/users.json'))
const friendships = JSON.parse(fs.readFileSync(__dirname + '/friendships.json'))

app.get('/api/*', async (req, res) => {
  if (req.path.startsWith('/api/users/')) {
    console.log(req.params)
    path = req.path.slice(11)
    console.log(path)
    if (path.startsWith('get')) {
      if (!(Number(path.slice(4)))) return
      founduser = users.find(u => u.id == Number(path.slice(4)))
      if (!founduser) return
      res.send(founduser)
    }
    if (path.startsWith('addfriend')) {
      if (!(Number(path.slice(10)))) return
      id1 = Number(path.slice(10))
      if (!Number(req.query['target'])) return
      id2 = Number(req.query['target'])
      friendships.push([id1, id2])
      fs.writeFile(__dirname + '/friendships.json', JSON.stringify(friendships, null, 2), (err) => {if (err) console.log(err)})
      filtered = friendships.filter(friendship => friendship.includes(id1))
      res.send({confirmation: true, newfriends: filtered})
    }
    if (path.startsWith('friends')) {
      if (!(Number(path.slice(8)))) return
      filtered = friendships.filter(friendship => friendship.includes(Number(path.slice(8))))
      res.send({friends: filtered})
    }
    if (path.startsWith('find/')) {
      type = path.slice(5)
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
