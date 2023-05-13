const express = require("express");
const router = express.Router();


// #1 import in the Poster model
const { Poster, MediaProperty } = require('../models')
const { bootstrapField, createPosterForm } = require('../forms');

router.get('/', async (req, res) => {
    // #2 - fetch all the posters (ie, SELECT * from posters)
    let posters = await Poster.collection().fetch({
        withRelated:['mediaProperty']
    });
    res.render('posters/index', {
        'posters': posters.toJSON() // #3 - convert collection to JSON
    })
})

router.get('/create', async (req, res) => {
   
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')];
    })

    const posterForm = createPosterForm(allMediaProperties);
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')];
    })


    const posterForm = createPosterForm(allMediaProperties);
    posterForm.handle(req, {
        'success': async (form) => {
                // 2. Save data from form into the new product instance
            const poster = new Poster(form.data);

            // const poster = new Poster();
            // poster.set('title', form.data.title);
            // poster.set('cost', form.data.cost);
            // poster.set('description', form.data.description);
            // poster.set('date', form.data.date);
            // poster.set('stock', form.data.stock);
            // poster.set('height', form.data.height);
            // poster.set('width', form.data.width);
            await poster.save();
            res.redirect('/posters');

        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/:poster_id/update', async (req, res) => {
    // retrieve the poster
    const posterId = req.params.poster_id
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        require: true
    });

    // fetch all the categories
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')];
    })    
    
    

    const posterForm = createPosterForm(allMediaProperties);

    // fill in the existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');
    posterForm.fields.mediaProperty_id.value = poster.get('mediaProperty_id');

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON()
    })

})

router.post('/:poster_id/update', async (req, res) => {

    // fetch all the categories
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')];
    })    
    

    // fetch the product that we want to update
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });

    // process the form
    const posterForm = createPosterForm(allMediaProperties);
    posterForm.handle(req, {
        'success': async (form) => {
            poster.set(form.data);
            poster.save();
            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'poster': poster.toJSON()
            })
        }
    })

})


router.get('/:poster_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });

    res.render('posters/delete', {
        'poster': poster.toJSON()
    })

});

router.post('/:poster_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });
    await poster.destroy();
    res.redirect('/posters')
})

module.exports = router;