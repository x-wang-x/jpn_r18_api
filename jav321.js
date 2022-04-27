const withDNS = require('axios-with-dns');
var axios = require('axios');
const cheerio = require('cheerio');
const { html } = require('cheerio/lib/api/manipulation');
const pretty = require("pretty");

withDNS(axios);

async function search(id) {
    var artist=[]
    lis={}
    var genre=[]
    var images=[]
    try {
        // let response = await axios(config);
        let response = await axios.get(`http://en.jav321.com/video/h_127ytr00058`, { dnsServer: '1.1.1.1' });
        res = await response.data;
        const $ = cheerio.load(res);
        // console.log($.html())
        if($('body').text()=='error Too many connections'){
            lis.status=404
            lis.reason="Too Many Connection"
        }
        else if($('body > div > div > div.k-right > div.container-fluid > div:nth-child(2) > div').text()=='Not Found!'){
            lis.status=404
            lis.reason="Not Found"
        }
        else {
            lis.status=200
            const x = $('body > div:nth-child(3) > div.col-md-7.col-md-offset-1.col-xs-12 > div:nth-child(1) > div.panel-body > div:nth-child(1) > div.col-md-9')
            $('body > div:nth-child(3) > div.col-md-3 > .col-xs-12.col-md-12').each(function (n,e){
                // console.log($(this).find('img').attr(`src`))
                val = $(this).find('img').attr(`src`)
                if(val!=undefined){
                    images.push(val)
                }
                
            })  
            console.log($(x).html())
            lis.title = $('body > div:nth-child(3) > div.col-md-7.col-md-offset-1.col-xs-12 > div:nth-child(1) > div.panel-heading > h3').text()
            lis.cover = $('.img-responsive').attr(`src`)
            lis.maker = $('body > div:nth-child(3) > div.col-md-7.col-md-offset-1.col-xs-12 > div:nth-child(1) > div.panel-body > div:nth-child(1) > div.col-md-9 > a:nth-child(6)').text()
            // lis.actor = $('body > div:nth-child(3) > div.col-md-7.col-md-offset-1.col-xs-12 > div:nth-child(1) > div.panel-body > div:nth-child(1) > div.col-md-9 > a:nth-child(2)').text()
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
            // lis.actor=artist
            lis.images=images
            lis.trailer = $('video > source').attr('src')
            }
        }
    catch(e) {
        // console.log(e.code)
        lis.status=404
        lis.reason=e.code
    }
    // console.log(lis)
    return lis
    // return JSON.stringify(lis);
}

( async() => {
    let x = await search('jul-896')
    console.log(x)
})()

module.exports = {search};