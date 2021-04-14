// jshint esversion:6
// DONT USE EXACT VARIABLE'S NAME EVEN IN COMMENT
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js"); //modul nasz plik z data przeniesiony z geta stad do zewn. pliku
const _ = require("lodash");

//console.log(date);

const app = express();

app.set('view engine', 'ejs'); // use ejs as view engine

app.use(bodyParser.urlencoded({extended: true})); // trzeba okreslic, ze tego uzywamy a chcemy parsowac tu body.name z html do posta serwera
app.use(express.static("public")); // dodajemy css i inne folderze public do projektu bo to express

// "mongodb://localhost:27017/todolistDB"
mongoose.connect("mongodb+srv://admin-adrian:test@cluster0.0bblx.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}); //deprecated: the last one make findAndUpdate useful //findAndUpdate,findAndRemove same behaviour in this case


//DB
const itemsSchema = new mongoose.Schema({
name: String
});
const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 =new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

//TEMP FOR DATA
const defaultItems = [item1, item2, item3];


//dynamic list Schema express
const listSchema = new mongoose.Schema({ // schemat custom listyToDo
  name: String,
  items: [itemsSchema] // zagniezdzony schemat w parametrze innego schematu
});
const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) { // kiedy user chce home route to serwer pobiera dane i co wysyla, to nizej

//let day = date(); //wywolujemy ten modul nasz z data
let day = date.getDate();


  // zamiat switcha mozna uzyc js opcji i funkcji gotowych powyzej

  // var currentDay = today.getDay();
  // var day = "";

  // switch (currentDay) {
  //   case 0:
  //     day = "Sunday";
  //     break;
  //   case 1:
  //     day = "Monday";
  //     break;
  //   case 2:
  //     day = "Tuesday";
  //     break;
  //   case 3:
  //     day = "Wednesday";
  //     break;
  //   case 4:
  //     day = "Thursday";
  //     break;
  //   case 5:
  //     day = "Friday";
  //     break;
  //   case 6:
  //     day = "Saturday";
  //     break;
  //   default:
  //   console.log("Error: current day is equal to: " + currentDay);
  // }


  // if (today.getDay() === 6 || today.getDay() === 0) {
  // if (currentDay === 6 || currentDay === 0) {
  //   day = "Weekend";
  //   res.render("list", {kindOfDay: day}); // render file called list and parse that file with var kindOfDay
  // res.write("<h1>yay it's a weekend!</h1>");


  // } else {
  //   // res.write("<p>Boo! I have to work!</p>");
  //   // res.write("<h1>NOT a weekend!</h1>");
  //   // res.send();
  //   //day = "day";
  // }


  //FIND ITEMS IN DB {} nie tylko name, ale wszystko co jest
  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {

      //INSERT ITEMS TO DB przeniesione luzno z get
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Items are added.");
        }
      });
        //dodane redirect, zeby wrocilo do glownej route, przeszlo, ale minelo ifa tym razem - taki refresh
      res.redirect("/");

    } else {
      //zdefiniowane obie, przeniesione z geta luzno, zeby renderowalo po wrzuceniu
      res.render("list", {listTitle: "Today", newListItems: foundItems}); // tu bylo items jako array, a teraz foundItems do bazy//pryeniesione do callbacka z baza
    }
    //console.log(foundItems);
  });

});

//DYNAMIC LIST np /work /something /main laczy z listSchema - nowy schemat na doc
app.get("/:customListName", function(req, res){
const customListName = _.capitalize(req.params.customListName); //lodash, zamiast console.log, do zmiennej

List.findOne({name: customListName}, function(err, foundList) {
  if (!err) {
    if (!foundList){
          //CREATE A NEW LIST
          const list = new List({
          name: customListName,
          items: defaultItems
        });

       list.save(); // save to list collection
       res.redirect("/" + customListName); //redirect do tego, co chcial user
      } else {
          // SHOW AN EXISTING LIST
             res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            //console.log("exists");
      }
    }
  });

});


app.post("/", function(req, res){

const itemName = req.body.newItem; // lapiemy tego posta z html po nazwie name
const listName = req.body.list; // dodany, tap not only itemName but also listName, grab the value of the variable listTitle

const item = new Item({ // new document, konstruktor
  name: itemName
});

//if try to submit a new Item to a default list, it should be diffrent than adding to a custom list

if (listName === "Today"){
//"today list"
  item.save();
  res.redirect("/");
} else {
  //"custom list" / search for that listDocument in a list collection in DB, we need add Item, embedded into existing array of items..
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}

//   if (req.body.list === "Work"){
//     workItems.push(item);
//   } else {
//     // kazdego razu, gdy robimy post request to dodaje do items nowy rekord
//     items.push(item); // z pythona append
//     // zamiast render ponizej, mozna przekierowanie zrobic tu w poscie do home route, a w  get zdefiniowac obie zmienne z ejs
//     res.redirect("/");
//     // trzeba dodac jescze ten newListItem do geta bo nie ma zdefiniowanej co ma serwer otrzymac mimo wszystko
//       // res.render("list", {newListItem: item}); // list w sensie list.ejs i potem jaki element nazwa: i value item zmienna, to wyzej.. taki parsing
//   }
// //  console.log(req.body);
// //  console.log(item);
// });
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  // console.log(req.body.checkbox);
  const listName = req.body.listName; // we can now check what is the value of listName parsed from list hidden element

  // check  see if we are making post.req to do delete an item from default list or delete from custom list
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      console.log("Checked item has been succesfully deleted."); // delete ale nie odswieza interfejsu, redirect!
      res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});
//BLOCK ELSE ABOVE
//request from custom list // find the list Document that has the current list Name and need update that list to remove checkedItemId
    //inside of listDocument is items: in Schema, array we need to look at every element in array - used MongoDB method

//which list to find, what update we are gonna make, callback
      //pull from items array an item that has a id: checkedItemId: items w listSchema




// app.get("/work", function(req, res){
//   res.render("list", {listTitle: "work", newListItems: workItems});
// });

// app.post("/work", function(req, res){
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
 });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
