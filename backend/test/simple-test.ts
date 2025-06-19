const http = require('http');

// utils
function my_post(url, data, token) {
    const dataString = JSON.stringify(data)
    let header = {}
    if(token) {
        header = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length,
            Authorization: 'Bearer ' + token
        }
    } else {
        header = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length,
        }
    }

    const options = {
      method: 'POST',
      headers: header,
      timeout: 1000, // in ms
    }
  
    return new Promise((resolve, reject) => {
      const req = http.request(url, options, (res) => {
        if (res.statusCode < 200 || res.statusCode > 299) {
          console.log(res.message)
          return reject(new Error(`HTTP status code ${res.statusCode}: ${res.statusMessage}`))
        }
  
        let body = []
        res.on('data', (chunk) => body.push(chunk))
        res.on('end', () => {
          const resString = Buffer.concat(body).toString()
          resolve(resString)
        })
      })
  
      req.on('error', (err) => {
        reject(err)
      })
  
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request time out'))
      })
  
      req.write(dataString)
      req.end()
    })
  }

  function my_delete(url, data, token) {
    const dataString = JSON.stringify(data)
    let header = {}
    if(token) {
        header = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length,
            Authorization: 'Bearer ' + token
        }
    } else {
        header = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length,
        }
    }

    const options = {
      method: 'DELETE',
      headers: header,
      timeout: 1000, // in ms
    }
  
    return new Promise((resolve, reject) => {
      const req = http.request(url, options, (res) => {
        if (res.statusCode < 200 || res.statusCode > 299) {
          return reject(new Error(`HTTP status code ${res.statusCode}`))
        }
  
        let body = []
        res.on('data', (chunk) => body.push(chunk))
        res.on('end', () => {
          const resString = Buffer.concat(body).toString()
          resolve(resString)
        })
      })
  
      req.on('error', (err) => {
        reject(err)
      })
  
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request time out'))
      })
  
      req.write(dataString)
      req.end()
    })
  }


function my_get(url, token) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

my_post("http://localhost:3000/users/login", {
        username: "thomas",
        password: "thomasthomas",
    }, false).then((res)=>{
      const token = JSON.parse(res)["access_token"];
      // owner
      /*
      post("http://localhost:3000/blinds/create", {
        title: "test"
    }, token).then(console.log);*/
    
    //delete_("http://localhost:3000/blinds/delete/1", token).then(console.log)
    //get("http://localhost:3000/blinds/get", token).then(console.log)

    // collab
    
    my_post("http://localhost:3000/blinds/addCollaborator", {
      id: 1,
      username: "test1"
    }, token).then((res)=>{
      console.log(res)
    //get("http://localhost:3000/blinds/get", token).then(console.log)
    

    my_get("http://localhost:3000/blinds/get", token).then((res)=>{
      console.log(res);
      my_delete("http://localhost:3000/blinds/removeCollaborator",{
        id: 1,
        username: "test1"
      }, token).then((res)=>{
        console.log(res)
        my_get("http://localhost:3000/blinds/get", token).then(console.log)
      })
    })})
  })
