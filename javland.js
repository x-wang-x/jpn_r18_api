const withDNS = require('axios-with-dns');
var axios = require('axios');
const cheerio = require('cheerio');
const { html } = require('cheerio/lib/api/manipulation');
const pretty = require("pretty");
const https = require('https')
withDNS(axios);

async function search(id) {
    var artist=[]
    lis={}
    var genre=[]
    var images=[]
    // var config = {
    // method: 'get',
    // url: `https://jav.land/en/id_search.php?keys=${id}`,
    // headers: { 
    //     'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"', 
    //     'sec-ch-ua-mobile': '?0', 
    //     'sec-ch-ua-platform': '"Windows"', 
    //     'Upgrade-Insecure-Requests': '1', 
    //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36', 
    //     'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9', 
    //     'Sec-Fetch-Site': 'same-origin', 
    //     'Sec-Fetch-Mode': 'navigate', 
    //     'Sec-Fetch-User': '?1', 
    //     'Sec-Fetch-Dest': 'document'
    // }
    // };
    try {
        // let response = await axios(config);
        let response = await axios.get(`https://jav.land/en/id_search.php?keys=${id}`, { dnsServer: '1.1.1.1'});
        // if(response.statusCode == 403){
        //     return { status : error}
        // }
        res = await response.data;
        const $ = cheerio.load(res);
        // console.log($.html())
        if($('body').text()=='error Too many connections'){
            lis.status="error"
            lis.reason="Too Many Connection"
        }
        else if($('body > div > div > div.k-right > div.container-fluid > div:nth-child(2) > div').text()=='Not Found!'){
            lis.status="error"
            lis.reason="Not Found"
        }
        else {
            lis.status="ok"
            const x = $('.videotextlist  > tbody > tr > td')
            $('#waterfall > a').each(function (n,e){
                // console.log($(this).attr(`href`))
                images.push($(this).attr(`href`))
            })  
            
            lis.title = $('body > div.container-fluid > div > div.k-right > div:nth-child(1) > div:nth-child(1) > div > strong').text()
            lis.cover = $('.img-responsive').attr(`src`)
            x.each(function (idx, el) {
                if(idx==1){
                    // console.log($(this).text())
                    lis.content=$(this).text();
                }
                else if(idx==3){
                    // console.log($(this).text())
                    lis.id=$(this).text();
                }
                else if(idx==5){
                    // console.log($(this).text())
                    lis.release_date=$(this).text();
                }
                else if(idx==7){
                    // console.log($(this).text())
                    lis.duration=$(this).text().replace(/\D/g,'');
                }
                else if ($(this).find(`span`).length>1) {
                    if ($(this).find(`span`).hasClass(`director`)) {
                        lis.director=$(this).find(`a`).text()
                    }
                    else if ($(this).find(`span`).hasClass(`maker`)) {
                        lis.maker=$(this).find(`a`).text()
                    }
                    else if ($(this).find(`span`).hasClass(`label1`)) {
                        lis.label=$(this).find(`a`).text()
                    }
                    else if ($(this).find(`span`).hasClass(`genre`)) {
                        $(this).find(`.genre`).each(function (n,e){
                            // console.log($(e).text())
                            genre.push($(e).text())
                        })    
                    }
                    else if ($(this).find(`span`).hasClass(`cast`)) {
                        $(this).find(`.cast`).each(function (n,e){
                            // console.log($(e).text())
                            artist.push($(e).text())
                        })    
                    }
                }
                else {
                    // console.log($(this).text())
                }
            });
            lis.tags=genre
            lis.actor=artist
            lis.images=images
            }
        }
    catch(e) {
        // console.log(e.message)
        lis.status='error'
        lis.message=e.message
        // throw e;
    }
    // console.log(lis)
    // return lis
    return JSON.stringify(lis);
}

// ( async() => {
//     let x = await search('jul-896')
//     console.log(x)
// })()

module.exports = {search};