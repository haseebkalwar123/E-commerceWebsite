var router=require('express').Router();
var Category=require('../models/category');

router.get('/add-category',function(req,res,next)
{
    res.render('vendor/add-category',{message:req.flash('suceess')});
});

router.post('/add-category',function(req,res,next)
{
var category=new Category();
category.name=req.body.name;
category.save(function(err)
{
    if(err) return next(err);
    req.flash('Success','item Added');
    return res.redirect('/add-category');
});
});
module.exports=router;
