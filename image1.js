#!/usr/bin/node

const url = require("url");
const https = require("https");
const csv = require("csv-parser");
const fs = require("fs");
const probe = require("probe-image-size");
const { Parser } = require("json2csv");
const async = require('async')

const sizeOf = require("image-size");
const csvResults = [];
const actualResult=[]
let count = 1000;
//const imgUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD6N6EsJkG-MtPQidOYffGsS_KBw8zAANAkxroJFxh&s'

const getImageHtWtChunk=(csvResults)=>{
//console.log("csv results are ", csvResults)
    const resultArray = csvResults.map((item, index) => {
        // console.log('item---',item.sku_id )
        return probe(item.product_image).then((val) => {
            const temp=item;
            temp.height = val.height;
            temp.width=val.width;
            return temp;
        }).catch((e)=>{
            console.log("image finding issue ", e)
            const temp=item;
            temp.height = 'error';
            temp.width='error';
            return temp;
            
        });
      });
      console.log("result array ", resultArray)
    return   Promise.all(resultArray).then((val)=>{
        //console.log("chunk data is ", val);
      
        actualResult.push(...val);
        console.log("actual result ", actualResult.length)
        setTimeout(()=>{
            console.log("wait or a while")
        },1000)
      }).catch((e)=>{
        console.log("error is ", e);
      })
   
}


// reading csv values
const csvParser = async () => {
  await fs
    .createReadStream("RealImageData.csv")
    .pipe(csv())
    .on("data", (data) => csvResults.push(data))
    .on("end", async() => {
      //console.log("here iam ", csvResults);
      console.log("i am waiting ")

    for(let i=0;i<csvResults.length; ){
        const arrayProcess = csvResults.slice(i,count);
        await getImageHtWtChunk(arrayProcess);
        console.log("in loop reLOCKEd =--------")
        i=count;
        count=count+1000;      
    }
            const parser = new Parser();
        const csv = parser.parse(actualResult);

     fs.writeFile("Result.csv", csv, "utf8", function (err) {
          if (err) {
            console.log(
              "Some error occured - file either not saved or corrupted file saved."
            );
          } else {
            console.log("It's saved!");
          }
        });
     
    

//sleep 



    //   const resultArray = csvResults.map(async(item, index) => {
    //     // console.log('item---',item.sku_id )
    //    let val ;
    //     setTimeout(()=>{
    //          val =   probe(item.product_image).then((val)=>{
    //             return { item, height: val.height, width: val.width };  
    //         })
    //         //return val;
    //     },500)
    //     console.log("val is ", val);
    //     return val
    //   });

    // for(let i =0 ; i<csvResults.length;i++){
    //     let temp1=csvResults[i] ;
        
    //         const val = await probe(temp1.product_image);
    //             temp1.height = val.height;
    //             temp1.width=val.width;
               
    //             csvResults[i]=temp1;
    //             console.log("csv item wise ",csvResults[i] ) 

    // }
   

    

    //   Promise.all(resultArray).then((val) => {
    //     const parser = new Parser();
    //     const csv = parser.parse(val);
    //     //console.log(csv);

    //     fs.writeFile("Result.csv", csv, "utf8", function (err) {
    //       if (err) {
    //         console.log(
    //           "Some error occured - file either not saved or corrupted file saved."
    //         );
    //       } else {
    //         console.log("It's saved!");
    //       }
    //     });
    //   });
     
    });
};

try {
 
             csvParser().then((val)=>{
                console.log('csx results is ++++++++++++',csvResults)
             });  
  
} catch (e) {
  console.log("in ther errpp", e);
}

//calculatign image height and width





const calcImageHeightWidth = (imgUrl, item) => {
    const options = url.parse(imgUrl);
  
    https.get(options, (response) => {
      const chunks = [];
      response
        .on("data", function (chunk) {
          chunks.push(chunk);
        })
        .on("end", function () {
          const buffer = Buffer.concat(chunks);
          console.log(sizeOf(buffer), "-----", item.sku_id);
          return {
            ...item,
            height: sizeOf(buffer).height,
            width: sizeOf(buffer).width,
          };
          //  return sizeOf(buffer)
        });
    });
  };

