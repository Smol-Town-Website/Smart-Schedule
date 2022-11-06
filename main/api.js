async function getData(url) {
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'GET',
      headers: {
          'Accept': 'application/json',
      },
    })
    .then(response => response.text())
    .then(text => resolve(text))
  })
}

function api() {
  const base = "https://Smart-Schedule.sungame7.repl.co/api/"

  var users = {
    async get(id) {
      data = await getData(base + 'users/get/' + id)
      return (JSON.parse(data))
    },
    async getiCal(id) {
      data = await getData(base + 'users/getiCal/' + id)
      return (JSON.parse(data))
    },
    async friends(id) {
      data = await getData(base + 'users/friends/' + id)
      return (JSON.parse(data))
    },
    async addfriend(id, target_id) {
      data = await getData(base + 'users/addfriend/' + id + '?target=' + target_id)
      return (JSON.parse(data))
    },
    async accept(user_id, event_id) {
      data = await getData(base + 'users/accept/' + event_id + '?user_id=' + user_id)
      return (JSON.parse(data))
    },
    async allUsers() {
      data = await getData(`${base}/users/allUsers`)
      return JSON.parse(data)
    },
    async find(inputType, input) {
      data = await getData(base + 'users/find/' + inputType + '?input=' + input)
      return (JSON.parse(data))
    },
    async updateAvailability(id, day, options) {
      data = await getData(base + 'users/set_avail/' `${id}?day=${day}&ow=${options.openWindow}&cw=${options.closeWindow}&op=${otions.openPreferred}&cp=${options.closePreferred}`)
      return (JSON.parse(data))
    },
    async getEvents(id) {
      console.log(base + 'getEvents/' + id)
      data = await getData(base + 'users/getEvents/' + id)
      return (JSON.parse(data))
    },
    async register(options) {
      data = await getData(base + `usersregister?first=${options.first}&last=${options.last}&monday-open=${options.availability.monday['open']}&monday-open-prefer=${options.availability.monday['close-prefer']}&monday-close-prefer=${options.availability.monday['close-prefer']}&monday-close=${options.availability.monday['close']}&tuesday-open=${options.availability.tuesday['open']}&tuesday-open-prefer=${options.availability.tuesday['close-prefer']}&tuesday-close-prefer=${options.availability.tuesday['close-prefer']}&tuesday-close=${options.availability.tuesday['close']}&wednesday-open=${options.availability.wednesday['open']}&wednesday-open-prefer=${options.availability.wednesday['close-prefer']}&wednesday-close-prefer=${options.availability.wednesday['close-prefer']}&wednesday-close=${options.availability.wednesday['close']}&thursday-open=${options.availability.thursday['open']}&thursday-open-prefer=${options.availability.thursday['close-prefer']}&thursday-close-prefer=${options.availability.thursday['close-prefer']}&thursday-close=${options.availability.thursday['close']}&friday-open=${options.availability.friday['open']}&friday-open-prefer=${options.availability.friday['close-prefer']}&friday-close-prefer=${options.availability.friday['close-prefer']}&friday-close=${options.availability.friday['close']}&saturday-open=${options.availability.saturday['open']}&saturday-open-prefer=${options.availability.saturday['close-prefer']}&saturday-close-prefer=${options.availability.saturday['close-prefer']}&saturday-close=${options.availability.saturday['close']}&sunday-open=${options.availability.sunday['open']}&sunday-open-prefer=${options.availability.sunday['close-prefer']}&sunday-close-prefer=${options.availability.sunday['close-prefer']}&sunday-close=${options.availability.sunday['close']}`)
    }
  }
  var events = {
    async get(id) {
      data = await getData(base + 'events/get/' + id)
      return JSON.parse(data)
    },
    async invite(inviter, target, event) {
      data = await getData(base + 'invite/' + inviter + '?sending_to=' + target + '&event_id=' + event)
      return JSON.parse(data)
    },
    async confirm(event_id, start, finish) {
      data = await getData(base + 'confirm/' + event_id + '?start=' + start + '&finish=' + finish)
      return JSON.parse(data)
    },
    async new(id, name, options) {
      data = await getData(`${base}/new/${id}`)
    }
  }
  
  const api = {
    users: users,
    events: events
  }
  return(api)
}