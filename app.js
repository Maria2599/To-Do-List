//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const workItems = [];

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1/todolistDB',{useNewUrlParser: true});
  }
 
const itemsSchema = mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema); 

const item1 = new Item({
  name: "Finish the course"
});

const item2 = new Item({
  name: "Finish the course"
});

const item3 = new Item({
  name: "Finish the course"
});

const defaultItems = [item1, item2, item3];

//List of Pages//
const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err,items){

    if(items.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully inserted");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }

  });
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create new List
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/"+ customListName);
      }else{
        console.log(foundList);
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
 
  
  
});

app.post("/delete",function(req,res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;


  if(listName === "Today"){
    Item.findByIdAndRemove({_id: checkedItemID}, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Item Successfully Deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull:{items: {_id: checkedItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }  

});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
