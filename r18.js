const cheerio = require('cheerio');
var axios = require('axios');

async function search(params) {
    let id=params;
    var lis = [];
        id=id.replace(' ','-');
        let  data=new Object;  
        var config = {
            method: 'get',
            url: `https://www.r18.com/common/search/?searchword=${id}&search_target=All`,
            headers: { 
            'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"', 
            'sec-ch-ua-mobile': '?0', 
            'sec-ch-ua-platform': '"Windows"', 
            'Upgrade-Insecure-Requests': '1', 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36', 
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9', 
            'Sec-Fetch-Site': 'same-origin', 
            'Sec-Fetch-Mode': 'navigate', 
            'Sec-Fetch-User': '?1', 
            'Sec-Fetch-Dest': 'document', 
            }
        };
        try {
            let response = await axios(config,{ dnsServer: '8.8.8.8' });
            data = await response.data;
            const $ = cheerio.load(data);
            $('.item-list').each(function (i, elem) {
                    lis.push({});
                    lis[i].code = $(this)
                    .find('.i3NLink > p > img')
                    .attr('alt');
                    lis[i].id = $(this).attr('data-content_id');
                })
            }
        catch(e) {
                console.log(e);
            }
        return await lis;
}
async function details(id) {
        let  data=new Object;
        var config = {
        method: 'get',
        url: `https://www.r18.com/api/v4f/contents/${id}`,
        headers: { 
            'Access-Control-Allow-Origin': '*', 
            'Accept': 'application/json, text/plain, */*', 
            'sec-ch-ua-mobile': '?0', 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36', 
            'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"', 
            'sec-ch-ua-platform': '"Windows"', 
            'Sec-Fetch-Site': 'same-origin', 
            'Sec-Fetch-Mode': 'cors', 
            'Sec-Fetch-Dest': 'empty', 
             }
        };
        try {
            let response = await axios(config);
            data = await response.data;
            // data.http = response.status;
        }
        catch(e) {
            // data.http = e.response.status;
            console.log(e);
        }
        return await data;
    }
async function get(params) {
    let data = await search(params);
    if (data.length==0) {
        return {status : 'error' , message:'Not Found'};
    }
    else {
        JSON.stringify(data)
        if(data[0].code.toLowerCase()==params.toLowerCase()){
            data =  await details(data[0].id);
            let actresses = []
            let categori = []
            data.data.actresses.forEach(element => {
                actresses.push(element.name);
            });
            data.data.categories.forEach(element => {
                categori.push(element.name);
            });
            let gallery = []
                if (data.data.gallery!=null) { 
                    for (let index = 0; index < data.data.gallery.length; index++) {
                        gallery.push(data.data.gallery[index].large)
                    }
                }
            return {
                status : "ok",code : data.data.dvd_id, title : data.data.title , cover: data.data.images.jacket_image.large, release : data.data.release_date, maker: data.data.maker.name, genre: categori, artist : actresses,gallery: gallery
            }
        }
        else
            return {status : 'error' , message:'Cannot fetch data'};
    }
}
function uncen(params) {
    params=params.replace(/\*/g,'-');
    var censored = ["D-ck","S---e","S---------l","S--------l","Sch--l","F---e","F-----g","P----h","M----t","S-----t","T-----e","D--g","H-------e","C---d","V-----e","Y--------l","A-----t","D---king","D---k","V-----t","S------g","R--e","R----g","S--t","K----r","H-------m","G------g","C-ck","K-ds","K----p","A----p","U---------s","D------e","P--------t","M------------n"];
    var uncensored = ["Dick","Slave","School Girl","Schoolgirl","School","Force","Forcing","Punish","Molest","Student","Torture","Drug","Hypnotize","Child","Violate","Young Girl","Assault","Drinking","Drunk","Violent","Sleeping","Rape","Raping","Scat","Killer","Hypnotism","Gangbang","Cock","Kids","Kidnap","Asleep","Unconscious","Disgrace","Passed Out","Mother And Son"];
    for (let index = 0; index < censored.length; index++) {
        let re = new RegExp(censored[index],'g');
        params = params.replace(re,uncensored[index])
    }
    return params;
}
// ( async() => {
//     let data = await get('SSIS-371');
//     console.log(data)
// })()
module.exports = {details,search,get,uncen};