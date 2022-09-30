const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");

//settings paht for bootstrap and jquery
var urlencodedParses = bodyParser.urlencoded({ extended: false });
app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/jquery/dist"))
);
//connecting to monogdb
mongoose.connect("mongodb+srv://wasifsyed02:simnani123@cluster0.ahbuarc.mongodb.net/todo_lists_db");

const ItemSchema = new mongoose.Schema({
  name: String,
});
const listSchema = new mongoose.Schema({
  name: String,
  items: [ItemSchema],
});
const Lists = mongoose.model("list", listSchema);
const Item = mongoose.model("Item", ItemSchema);
const i1 = new Item({ name: "Welcome to todo list" });
const i2 = new Item({ name: "This is test" });
const i3 = new Item({ name: "hit the add button to add new  list" });

//setting views.
app.set("views", path.join(__dirname, "views"));
//settings engine.
app.set("view engine", "ejs");
// now request methods
app.get("/", (req, res) => {
  const listName="root"
  Item.find({}, function (err, items) {
    if (items.length == 0) {
      Item.insertMany([i1, i2, i3], function (err) {
        if (err) console.log(err);
        else console.log("data successfully inserted");
      });
    }
    res.render("index", {listName,items });
  });
});
// using post method to retried the new elements
app.post("/add", urlencodedParses, function (req, res) {
  if (req.body.task == "") {
    res.redirect("/");
  }
  const listName=req.body.listName.trim().toLowerCase()
  const item = new Item({ name: req.body.task });
  if(listName=="root"){
    item.save()
  }
  
  else{
    Lists.findOne({name:listName},function(err,result){
     if(result){
      result.items.push(item)
      result.save()
     }
    })
    res.redirect('/'+listName)
  }
});
app.post("/delete", urlencodedParses, function (req, res) {
  var id = req.body.id;
  var listName = req.body.listName.trim().toLowerCase();
  if(listName=="root"){
    Item.findByIdAndRemove(id, function (err) {
      if (!err) {
        console.log("item removed successfully");
        res.redirect("/");
      }
    });
  }
  else{
    Lists.findOneAndUpdate({name:'home'},{$pull:{items:{_id:id}}},function(err,result){
      console.log(result)
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  
  
});
//creating todo as per customerName
app.get("/:customerName", function (req, res) {
  const customerName = req.params.customerName.trim().toLowerCase()
  Lists.findOne({ name: customerName }, function (err, result) {
    if (!err) {
      if (!result) {
        const list = new Lists({ name: customerName, items: [i1, i2, i3] });
        list.save();
        res.render('index',{listName:customerName,items:list.items})
      }
      else{
        res.render('index',{listName:customerName,items:result.items})
      }
      
    }
  });
});
let port=process.env.PORT;
if(port==null || port=="")
{
  port=3000;
}
app.listen(port, function () {
  console.log("server started at port 8000.");
});
