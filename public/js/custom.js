$(function() {

  Stripe.setPublishableKey('pk_live_QWVrR5j2IlECBX5vUO9uf2Pf00uhw2jutn');
  //   pk_live_QWVrR5j2IlECBX5vUO9uf2Pf00uhw2jutn
  //        pk_test_pS46u0GT5ELgLbtat7GGj6Qe00lMxM3gIO

  var opts = {
    lines: 13, // The number of lines to draw
    length: 38, // The length of each line
    width: 17, // The line thickness
    radius: 45, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#000', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    position: 'absolute' // Element positioning
  };


  $('#search').keyup(function() { //keyup is lesson function it lesson what we are typing

    var search_term = $(this).val();


    $.ajax({
      method: 'POST',
      url: '/api/search',
      data: {
        search_term
      },
      dataType: 'json',
      success: function(json) {

        var data = json.hits.hits.map(function(hit) {
          return hit;
        });
        $('#searchResults').empty();
        for (var i = 0; i < data.length; i++) {
          var html = "";
          html += '<div class="col-md-4">';
          html += '<a href="/product/' + data[i]._source._id + '">';
          html += '<div class="thumbnail">';
          html += '<img src="' + data[i]._source.image + '">';
          html += '<div class="caption">';
          html += '<h3>' + data[i]._source.name + '</h3>';
          html += '<p>' + data[i]._source.category.name + '</h3>';
          html += '<p>$' + data[i]._source.price + '</p>';
          html += '</div></div></a></div>';
          $('searchResults').append(html);

        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  });

  $(document).on('click', '#plus', function(e) {
    e.preventDefault();
    var priceValue = parseFloat($('#priceValue').val());
    var quantity = parseInt($('#quantity').val());
    priceValue += parseFloat($('#priceHidden').val());
    quantity += 1;
    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);
  });

  $(document).on('click', '#minus', function(e) {
    e.preventDefault();
    var priceValue = parseFloat($('#priceValue').val());
    var quantity = parseInt($('#quantity').val());
    if (quantity == 1) {
      priceValue = $('#priceHidden').val();
      quantity = 1;
    } else {
      priceValue -= parseFloat($('#priceHidden').val());
      quantity -= 1;
    }

    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);
  });


  function stripeResponseHandler(status, response) {
    var $form = $('#payment-form');

    if (response.error) {
      //show error on form
      $form.find('.payment-errors').text(response.error.message);
      $form.find('button').prop('disabled', false);
    } else {
      //response contain id and card, which contains additional card detail
      var token = response.id();
      //Insert the token into form so it get submitted to server
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));

      var spinner = new Spinner(opts).spin();
      $('#loading').append(spinner.el);
      //and submit
      $form.get(0).submit();
    }
  };

  $("#payment-form").submit(function(event) {
    var $form = $(this);

    //Disable the submit button to prevent repeated clicks
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, stripeResponseHandler);

    //prevent the form from submitting with default action
    return false;
  });



});
