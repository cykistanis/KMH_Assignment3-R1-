const express = require("express");
const router = express.Router();


// #1 import in the Poster model
const { Poster, MediaProperty, Tag } = require('../models')
const { bootstrapField, createPosterForm } = require('../forms');

router.get('/', async (req, res) => {
    // #2 - fetch all the posters (ie, SELECT * from posters)
    

    let posters = await Poster.collection().fetch({
        withRelated:['mediaProperty', 'tags']
    });
    res.render('posters/index', {  
        'posters': posters.toJSON() // #3 - convert collection to JSON
    })
})

router.get('/create', async (req, res) => {
   
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')];
    })

    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);

    const posterForm = createPosterForm(allMediaProperties, allTags);
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')];
    })

    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);


    const posterForm = createPosterForm(allMediaProperties, allTags);
    posterForm.handle(req, {
        'success': async (form) => {
            let {tags, ...posterData} = form.data;
                // 2. Save data from form into the new product instance
            const poster = new Poster(posterData);

             await poster.save();
             if (tags) {
                await poster.tags().attach(tags.split(","));
            }
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
        require: true,
        withRelated:['tags']
    });

    

    // fetch all the categories
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')];
    })    

    // fetch all the tags
    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);
    
    const posterForm = createPosterForm(allMediaProperties, allTags);

    // fill in the existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');
    posterForm.fields.mediaProperty_id.value = poster.get('mediaProperty_id');

    // fill in the multi-select for the tags
    let selectedTags = await poster.related('tags').pluck('id');
    posterForm.fields.tags.value= selectedTags;

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

     // fetch all the tags
     const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);
    

    // fetch the product that we want to update
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true,
        withRelated:['tags']
    });

    // process the form
    const posterForm = createPosterForm(allMediaProperties, allTags);
    posterForm.handle(req, {
        'success': async (form) => {
            let { tags, ...posterData} = form.data;
            poster.set(posterData);
            poster.save();

            // update the tags
            
            let tagIds = tags.split(',');
            let existingTagIds = await poster.related('tags').pluck('id');

            // remove all the tags that aren't selected anymore
            let toRemove = existingTagIds.filter( id => tagIds.includes(id) === false);
            await poster.tags().detach(toRemove);

            // add in all the tags selected in the form
            await poster.tags().attach(tagIds);


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