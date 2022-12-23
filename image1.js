#!/usr/bin/node

const url = require('url')
const https= require('https')
const csv = require('csv-parser')
const fs = require('fs')
const probe = require('probe-image-size');
const { Parser } = require('json2csv');

const sizeOf = require('image-size')
const csvResults = [];

//const imgUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD6N6EsJkG-MtPQidOYffGsS_KBw8zAANAkxroJFxh&s'

// reading csv values 
const csvParser = async()=>{
    await fs.createReadStream('realImage.csv')
    .pipe(csv())
    .on('data', (data) => csvResults.push(data))
    .on('end', () => {

       const resultArray =  csvResults.map((item)=>{
           // console.log('item---',item.sku_id )
         return   probe(item.product_image).then((val)=>{
            let newItem = { ...item,height: val.height, width: val.width}
            return newItem
            })
            
        })
        Promise.all(resultArray).then((val)=>{
            const parser = new Parser();
            const csv = parser.parse(val);
            //console.log(csv);

fs.writeFile('Result.csv', csv, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('It\'s saved!');
    }
  });

        })
   //    console.log('result Array is ', resultArray); 

      //console.log(csvResults);
      // [
      //   { NAME: 'Daffy Duck', AGE: '24' },
      //   { NAME: 'Bugs Bunny', AGE: '22' }
      // ]
    });

}

try {
     csvParser();
    
}
catch(e){
    console.log("in ther errpp",e)
}





//calculatign image height and width 


const  calcImageHeightWidth= (imgUrl, item)=>{
    const options = url.parse(imgUrl)

    https.get(options,  (response)=> {
        const chunks = []
        response.on('data', function (chunk) {
          chunks.push(chunk)
        }).on('end', function() {
          const buffer = Buffer.concat(chunks)
          console.log(sizeOf(buffer),"-----", item.sku_id)
          return {...item,height: sizeOf(buffer).height, width: sizeOf(buffer).width}
        //  return sizeOf(buffer)
        
        })
      })
}



