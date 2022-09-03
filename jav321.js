const withDNS = require('axios-with-dns');
var axios = require('axios');
const cheerio = require('cheerio');
const { html } = require('cheerio/lib/api/manipulation');
const pretty = require("pretty");
var qs = require('qs');

withDNS(axios);

async function get(id) {
    var data = qs.stringify({
        'sn': id
      });
    try {
        var artist=[]
        lis={}
        var genre=[]
        var images=[]
        // let response = await axios(config);
        let response = await axios.post(`https://en.jav321.com/search`, data , { dnsServer: '1.1.1.1' });
        res = await response.data;
        const $ = cheerio.load(res);
        if($('body > div:nth-child(3) > div > div').text()=='Sorry, we can not find the video.'){
            lis.status='error'
            lis.message="Not Found"
        }
        else {
            lis.status='ok'
            const x = $('body > div:nth-child(3) > div.col-md-7.col-md-offset-1.col-xs-12 > div:nth-child(1) > div.panel-body > div:nth-child(1) > div.col-md-9')
            $('body > div:nth-child(3) > div.col-md-3 > .col-xs-12.col-md-12').each(function (n,e){
                // console.log($(this).find('img').attr(`src`))
                val = $(this).find('img').attr(`src`)
                if(val!=undefined){
                    images.push(val)
                }
                
            }) 
            lis.title = $('body > div:nth-child(3) > div.col-md-7.col-md-offset-1.col-xs-12 > div:nth-child(1) > div.panel-heading > h3').text()
            lis.cover = $('.img-responsive').attr(`src`)
            x.find('b').each(function (idx, el) {
                const a = $(this);
                let b = $(this).nextUntil('br').toArray(); // get element from b until br and convert it to Object
                let c= []
                if($(this).next().is('a')){ // check is next element is <a> tag or not
                    if(b.length>1){ //if more than 1 push to array
                        b.forEach(function(el,indx){
                            c.push(el.children[0].data)
                        }) 
                    }
                    else { // if just 1 convert to string
                        c = b[0].children[0].data 
                    }
                }
                else {
                    c = a[0].next.data.replace(': ','') // convert to string and remove unused element
                }
                // console.log(a)
                if(a.text()=='Release Date'){
                    lis.release = c
                }
                if(a.text()=='SN'){
                    lis.code = c.toUpperCase()
                }
                if(a.text()=='Stars'){
                    artist = c;
                }
                if(a.text()=='Genre'){
                    genre = c;
                }
                if(a.text()=='Studio'){
                    lis.maker = c;
                }
                if(a=='Play time'){
                    lis.duration = c;
                }
            })
            lis.tags=genre
            lis.actor=artist
            lis.images=images
            lis.trailer = $('video > source').attr('src')
            }
        }
    catch(e) {
        // console.log(e.code)
        lis.status='error'
        lis.reason=e.message
    }
    // console.log(lis)
    return lis
    // return JSON.stringify(lis);
}

// ( async() => {
//     let x = await get('asdadas')
//     console.log(x)
// })()

module.exports = {get};