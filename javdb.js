const withDNS = require('axios-with-dns');
var axios = require('axios');
const cheerio = require('cheerio');
const { html } = require('cheerio/lib/api/manipulation');
const pretty = require("pretty");
withDNS(axios);

  async function search(id,dns=false) {
    lis=[]
    var config = {
    method: 'get',
    url: `https://javdb.com//search?q=${id}&f=all`,
    headers: { 
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"', 
        'sec-ch-ua-mobile': '?0', 
        'sec-ch-ua-platform': '"Windows"', 
        'Upgrade-Insecure-Requests': '1', 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36', 
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9', 
        'Sec-Fetch-Site': 'same-origin', 
        'Sec-Fetch-Mode': 'navigate', 
        'Sec-Fetch-User': '?1', 
        'Sec-Fetch-Dest': 'document'
    }
    };
    try {
        if(dns==true){
            let response = await axios.get(`https://javdb.com//search?q=${id}&f=all`, { dnsServer: '8.8.8.8' });
            res = await response.data;
        }
        else {
            let response = await axios(config);
            res = await response.data;
        }
        
        
        const $ = cheerio.load(res);
        const x = $('body > section > div > div.movie-list.h.cols-4.vcols-8')
        
        x.each(function (idx, el) {
            lis.push({})
            lis[idx].id= $(this).find('.box').attr('href')
            lis[idx].code = $(this).find('.uid').text()
            lis[idx].title = $(this).find('.video-title').text()
          });
        }
    catch(e) {
        console.log(e.code);
    }
    return await lis;
}

async function details(id,dns=false) {
    lis = {}
    images = []
    let  data=new Object;
    var config = {
        method: 'get',
        url: `https://javdba.com//${id}?locale=en`,
        headers: { 
          'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"', 
          'sec-ch-ua-mobile': '?0', 
          'sec-ch-ua-platform': '"Windows"', 
          'Upgrade-Insecure-Requests': '1', 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36', 
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9', 
          'Sec-Fetch-Site': 'same-origin', 
          'Sec-Fetch-Mode': 'navigate', 
          'Sec-Fetch-User': '?1', 
          'Sec-Fetch-Dest': 'document',
        }
      };
    try {
        if(dns==true){
            let response = await axios.get(`https://javdb.com/${id}?locale=en`, { dnsServer: '8.8.8.8' });
            data = await response.data;
        }
        else {
            let response = await axios(config);
            data = await response.data;
        }
        lis.status="ok";
        const $ = cheerio.load(data);

        //this will get all of images / screenshot
        $('body > section > div > div.video-detail > div:nth-child(3) > div > article > div > div > .tile-item').each(function (n,e){
          images.push($(this).attr(`href`))
        })   
        //get title
        lis.title = $('.title.is-4 > strong').text()
        //trying to get cover image
        superid = id.replace("/v/",'')
        buck = id.substring(3, 5).toLowerCase()
        lis.cover =  `https://jdbimgs.com/covers/${buck}/${superid}.jpg` //getting cover
        x = $('nav.panel  .panel-block').length
        for (let el of $('.panel-block')) {
            //getting label in panel-block class element
            var label = $(el)
                .find('strong')
                .text()
            var res = []

            //detecting if there multiple value 
            if($(el).find('span > a').length>1){
                
                for(let y of $(el).find('span > a')){
                    res.push($(y).text())
                }
            }
            // only one value
            else {
                res = $(el)
                .find('span')
                .text()
                
            }

            //remove unused tags in string
            label = label.replace(/♀|♂/g,'')

            if(Array.isArray(res)){
                for (let index = 0; index < res.length; ++index) {
                    res[index] = res[index].replace(/\n\s*|\t/g,'').replace(/♀\s|♂\s/g,'')
                }
            }
            else{
                res = res.replace(/\n\s*|\t/g,'').replace(/♀\s|♂\s/g,'')
            }

            //getting value each
            if(label=="ID:"){
                lis.id = res
            }
            else if(label=="Released Date:"){
                lis.release_date = res
            }
            else if(label=="Duration:"){
                lis.duration = res.replace(/\D/g,'')
            }
            else if(label=="Director:"){
                lis.director = res
            }
            else if(label=="Maker:"){
                lis.maker = res
            }
            else if(label=="Series:"){
                lis.series = res
            }
            else if(label=="Tags:"){
                lis.tags = res
            }
            else if(label=="Actor(s):"){
                lis.actor = res
                break;
            }
        }
        lis.images = images

        if(lis.images.length==0){
            lis.images = null
        }
        lis.trailer = $('#preview-video > source').attr(`src`).replace('//','http://')
        if(lis.trailer==""){
            lis.trailer = null;
        }
    }
    catch(e) {
        lis.status="error";
        console.log(e.code);
    }
    function compareAge(a, b) {

        return a - b;
    }
    return await lis;
}
async function get(params) {
    var id=params.replace(' ','-');
    let data = await search(id,true)
    // console.log(data)
    if (data.length==0) {
        return null
    }
    else {
        JSON.stringify(data)
        // console.log(data[0].id)
        return await details(data[0].id,true)
    }
}

// // for test
// ( async() => {
//     // let x = await details("/v/Rd988",true)
//     let x = await get('IPX-248')
//     console.log(x)
// })()
module.exports = {details,search,get};