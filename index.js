const fs = require('fs');
const axios = require('axios');
// var _ = require('lodash');

// copy ->> node index.js https://en.wikipedia.org/wiki/Dog 5 intelligence

fs.writeFile("result.txt", "",(err) => {
  if (err){
    console.log('Result.txt Created')
  } else {
    console.log(err)
  }
})
// get search word
const getWordFromArg = /[^https://en.wikipedia.org/wiki/]\S+/g
const argWord = process.argv[2].match(getWordFromArg).join('')
const findAllWord = new RegExp('\/wiki\/' + argWord + '\\S*?\"', 'g')

// arr of links and finalArr with hits
const LINKS = [];
const finalArr = [];

// get hits
hitsCounter = (arr) => {
  arr.sort();
  let current = null;
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] != current) {
      if (count > 0) {
        finalArr.push(`${current} ${count}`);
      }
      current = arr[i];
      count = 1
    } else {
      count++
    }
  }
  if (count > 0) {
    finalArr.push(`${current} ${count}`);
  }
}

// clear 'file.txt'
fs.truncate('result.txt', 0, (err) => {
  if (err) {
    console.log('CAN\'T CLEAR FILE')
  } else {
    console.log('FILE IS CLEAR')
  }
})

async function getDataFromUrl(url, depth) {
  try {
    // make req
    const res = await axios.get(url)

    const word = res.data.split('\n');
    //chunk trash
    word.splice(0, 36)

    word.forEach((item) => {
      if (item.match(findAllWord)) {
        let links = item.match(findAllWord)
        links.forEach((item) => {
          LINKS.push(item.replace(/"/g, ''))
        })
      }
    })

    if (depth < 1 || !depth) { 
      // count of hits
      hitsCounter(LINKS)
      //  sort by hits
      finalArr.sort((a, b) => {
        let regExpDigit = /\d+$/;
        a = regExpDigit.exec(a);
        b = regExpDigit.exec(b);
        return b - a;
      }).forEach((item, i) => {
        console.log(item)
        fs.appendFile('result.txt', `https://en.wikipedia.org${item} \n`, function (err) {
          if (err) {
            console.log(err)
          } else {
            // console.log(item, i)
          }
        })
      })    
    }

    // deep search
    if (depth > 0) {     
        getDataFromUrl(`https://en.wikipedia.org${LINKS[depth - 1]}`, depth - 1);      
    }  

    console.log(depth, url)
  } catch (e) {
    console.error(e, ` WRONG LINK`);
  }
}

getDataFromUrl(process.argv[2], parseInt(process.argv[3]), process.argv[4])
