var axios = require('axios');
const cheerio = require('cheerio');
const { html } = require('cheerio/lib/api/manipulation');
const e = require('express');
const withDNS = require('axios-with-dns');
withDNS(axios);

async function geturl(url){
    var artist=[]
    lis={}
    var genre=[]
    try {
        let response = await axios.get(`${url}`, { dnsServer: '8.8.8.8' });
        res = await response.data;
        const $ = cheerio.load(res);
        // console.log($.html())
        if($('#rightcolumn > p > em').text()=='Search returned no result.'){
            lis.status=404
        }
        else if($('.videothumblist').length>0){
            lis.status=404
            var a = $('.videothumblist').find('.video').find('a').attr('href')
            a = `https://www.javlibrary.com/en/${a}`
            console.log(a)
        }
        else {
            lis.status=200
            const x = $('#rightcolumn')
            // console.log()
            lis.cover = $('#video_jacket_img').attr(`src`)
            lis.title = $(x).find(`#video_title`).find(`a`).text()
            lis.code = $(x).find(`#video_id`).find(`.text`).text()
            lis.release = $(x).find(`#video_date`).find(`.text`).text()
            lis.maker = $(x).find(`.maker`).find(`a`).text()       
            $(x).find(`#video_genres`).find(`.genre`).each(function (idx, el) {
                genre.push($(el).text())
            })
            $(x).find(`.cast`).each(function (idx, el) {
                // console.log()
                if($(el).find(`span`).hasClass('alias')){
                    if ($(el).find('.alias').length>1) {
                        aliases = []
                        $(this).find('.alias').each(function (id,e){
                            aliases.push($(e).text())
                        })
                        console.log(aliases.toString())
                        artist.push($(el).find('.star').text()+"("+aliases.toString()+")")
                    }
                    else{
                    artist.push($(el).find('.star').text()+"("+$(el).find('.alias').text()+")")
                    }
                }
                else {
                    artist.push($(el).find('.star').text())
                }
            })
            lis.genre=genre
            lis.artist=artist
            }
        }
    catch(e) {
        console.log(e)
        lis.status=404
    }
    // console.log(lis)
    return JSON.stringify(lis);
}
async function search(id) {
    var artist=[]
    lis={}
    var genre=[]
    try {
        // let response = await axios(config);
        let response = await axios.get(`https://www.javlibrary.com/en/vl_searchbyid.php?keyword=${id}`, { dnsServer: '8.8.8.8' });
        res = await response.data;
        const $ = cheerio.load(res);
        // console.log($.html())
        if($('#rightcolumn > p > em').text()=='Search returned no result.'){
            lis.status='error';
            lis.reason='No result.';
        }
        else if($('.videothumblist').length>0){
            // lis.status=404
            var a = $('.videothumblist').find('.video').find('a').attr('href')
            a = `https://www.javlibrary.com/en/${a}`
            var b = await geturl(a)
            lis = JSON.parse(b)
        }
        else {
            lis.status='ok'
            const x = $('#rightcolumn')
            lis.title = $(x).find(`#video_title`).find(`a`).text()
            lis.cover = $('#video_jacket_img').attr(`src`)
            lis.id = $(x).find(`#video_id`).find(`.text`).text()
            lis.release_date = $(x).find(`#video_date`).find(`.text`).text()
            lis.duration = $(x).find(`#video_length`).find(`.text`).text()
            lis.director = $(x).find(`#video_director > table > tbody > tr > td.text`).find(`a`).text()
            lis.maker = $(x).find(`.maker`).find(`a`).text()       
            $(x).find(`#video_genres`).find(`.genre`).each(function (idx, el) {
                genre.push($(el).text())
            })
            $(x).find(`.cast`).each(function (idx, el) {
                // console.log()
                if($(el).find(`span`).hasClass('alias')){
                    if ($(el).find('.alias').length>1) {
                        aliases = []
                        $(this).find('.alias').each(function (id,e){
                            aliases.push($(e).text())
                        })
                        console.log(aliases.toString())
                        artist.push($(el).find('.star').text()+"("+aliases.toString()+")")
                    }
                    else{
                    artist.push($(el).find('.star').text()+"("+$(el).find('.alias').text()+")")
                    }
                }
                else {
                    artist.push($(el).find('.star').text())
                }
            })
            
            $(x).find('.previewthumbs').find('a').each(function (idx, el) {
                lis.images.push($(el).attr('src'))
            })
            lis.tags=genre
            lis.actor=artist
            // lis.images=[]
            }
        }
    catch(e) {
        // console.log(e)
        lis.status='error'
        lis.reason=e
    }
    // console.log(lis)
    return await JSON.stringify(lis);
}

// ( async() => {
//     let x = await search('ssis-133')
//     console.log(x)
// })()

module.exports = {search};