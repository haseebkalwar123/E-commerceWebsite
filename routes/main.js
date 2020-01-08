const router = require('express').Router();
var User=require('../models/user');
var Product=require('../models/product');
var Cart = require('../models/cart');
var async = require('async');

var stripe = require("stripe")('sk_live_5tpJb1xaB7mh9t6Un7dOUVJM008X4telVB');

// router.get("/",function(req,res){
//  res.render('main/index')
//  });

function paginate(req,res,next){
  var prePage = 9;
  var page = req.params.page;
  Product
   .find()
   .skip(prePage * page)
   .limit(prePage)
   .populate('category')
   .exec(function(err,products){
      if (err) return next(err);
     Product.count().exec(function(err,count){
       if (err) return next(err);
       res.render('main/product-main',{
         products:products,
         pages:count/prePage
       });

     });
   });
}


Product.createMapping(function(err,mapping){   //used to create mapping betwwen product search and database
  if(err){
    console.log("error createing mapping ");
    console.log(err);
  }
  else {
    console.log("mapping created");
    console.log(mapping);
  }
});

var stream = Product.synchronize();
var count = 0;
stream.on('data',function(){
  count++;
});
stream.on('close',function(){
  console.log("Indexed"+count+"documents");
});
stream.on('error',function(err){
  console.log(err);
});

router.get('/cart',function(req,res,next){
  Cart
  .findOne({owner:req.user._id})
  .populate('items.item')
  .exec(function(err,foundCart){
    if (err) return next(err);
    res.render('main/cart',{
      foundCart:foundCart,
      message:req.flash('remove')
    });
  });
});


router.post('/product/:product_id',function(req,res,next){
    Cart.findOne({owner:req.user._id},function(err,cart){
      cart.items.push({
        item:req.body.product_id,
        price:parseFloat(req.body.priceValue),
        quantity:parseInt(req.body.quantity)
      });
      cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

      cart.save(function(err){
        if (err)  return next(err);
        return res.redirect('/cart');
      });
    });
});

router.post('/payment',function(req,res,next){

  var stripeToken = req.body.stripeToken;
  var currentCharges = Math.round(req.body.stripeMoney * 100);
  stripe.customers.create({
    source:stripeToken,
  }).then(function(customers){
      return stripe.charges.create({
        amount: currentCharges,
        currency:'usd',
        customer:customer.id
      });
  }).then(function(charge){
    async.waterfall([
        function(callback){
          Cart.findOne({owner:req.user._id},function(err,cart){
            callback(err,cart);
          });
        },
        function(cart,callback){
          User.findOne({_id:req.user._id},function(err,user){
            if (user){
              for (var i = 0; i < cart.items.length; i++) {
                user.history.push({
                  item:cart.items[i].item,
                  paid:cart.items[i].price
                });
              }
              user.save(function(err,user){
                if (err) return next(err);
                callback(err,user);
              });
            }
          });
        },
        function(user){
            Cart.update({owner:user._id},{$set : {items:[],total:0}},function(err,update){
             if (updated) {
                res.redirect('/profile');
               }
           });
       }
    ]);
  });
});
router.post('/remove',function(req,res,next){
  Cart.findOne({owner:req.user._id},function(err,foundCart){
     foundCart.items.pull(String(req.body.item));
     foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
     foundCart.save(function(err,found){
       if (err) return next(err);
       req.flash('remove','Successfully remove');
       res.redirect('/cart');
     });
  });
});

router.post('/search',function(req,res,next){
  res.redirect('/search?q='+req.body.q);
});
router.get('/search',function(req,res,next){
  if(req.query.q){
    Product.search({
      query_string:{query:req.query.q}
    },function(err,results){
      result:
       if(err) return next(err);
       var data = results.hits.hits.map(function(hit){
         return hit;
       });
       res.render('main/search-result',{
         query:req.query.q,
         data:data
       });
    });
  }
});


 router.get("/",function(req,res,next){
  if (req.user) {
    paginate(req,res,next);
  }
  else {
    res.render('main/home');
  }
 });
router.get("/about",function(req,res){
 res.render('main/about')
});


router.get('/page/:page',function(req,res,next){
  paginate(req,res,next);
});

router.get('/products/:id',function(req,res,next)
{
    Product
    .find({category:req.params.id})
    .populate('category')
    .exec(function(err,products)
    {
        if(err) return next(err);
        res.render('main/category',{

            products:products
        });
    });
});

router.get('/adminprofile',function(req,res,next)
{
    User
    .find({users:req.params.id})
    .populate('adminprofile')
    .exec(function(err,users)
    {
        if(err) return next(err);
        res.render('accounts/adminprofile',{
            users:users
        });
    });
});
router.post('/adminprofile',function(req,res,next){
  User.findOne({id:req.user._id},function(err,user){
       if (err) return next(err);
       req.flash('remove','Successfully remove');
       res.redirect('/adminprofile');
     });
});


router.get('/product/:id',function(req,res,next){
  Product.findById({_id:req.params.id},function(err,product){
    if(err) return next(err);
    res.render('main/product',{
      product:product
    });
  });
});


module.exports = router;
