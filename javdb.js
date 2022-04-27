var axios = require('axios');
const cheerio = require('cheerio');
const { html } = require('cheerio/lib/api/manipulation');
const pretty = require("pretty");

async function details(id) {
    lis = []
    let  data=new Object;
    var config = {
        method: 'get',
        url: `https://javdb39.com//${id}?locale=en`,
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
        let response = await axios(config);
        data = await response.data;
        const $ = cheerio.load(data);
        title = $('.title.is-4 > strong').text()
        lis.push(['Title', title])
        superid = id.replace("/v/",'')
        buck = id.substring(3, 5).toLowerCase()
        lis.push(['Cover ', `https://jdbimgs.com/covers/${buck}/${superid}.jpg`])
        x = $('nav.panel  .panel-block').length
        no=0;
        for (let el of $('nav.panel  .panel-block')) {
            let res = $(el)
            .find('span')
            .text()
            let label = $(el)
            .find('strong')
            .text()
            label = label.replace(/♀|♂/g,'')
            res = res.replace(/\n\s*|\t/g,'').replace(/♀\s|♂\s/g,'')
            if($(el).find('span > a').length>1){
                res = []
                for(let y of $(el).find('span > a')){
                    res.push($(y).text())
                }
            }
            lis.push([label,res])
            if(no==9){
                break
            }
            no++ 
        }
    }
    catch(e) {
        console.log(e);
    }
    return await lis;
}
async function search(id) {
    lis=[]
    var config = {
    method: 'get',
    url: `https://javdb39.com//search?q=${id}&f=all`,
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
        let response = await axios(config);
        res = await response.data;
        const $ = cheerio.load(res);
        const x = $('.grid-item')
        x.each(function (idx, el) {
            lis.push({})
            lis[idx].id= $(this).find('.box').attr('href')
            lis[idx].code = $(this).find('.uid').text()
            lis[idx].title = $(this).find('.video-title').text()
          });
        }
    catch(e) {
        console.log(e);
    }
    return await lis;
}
async function get(params) {
    var id=params.replace(' ','-');
    let data = await search(id);
    // console.log(data)
    if (data.length==0) {
        return null
    }
    else {
        JSON.stringify(data)
        return await details(data[0].id);
    }
}
// ( async() => {
//     let x = await get('adn-123')
//     console.log(x)
// })()
module.exports = {details,search,get};