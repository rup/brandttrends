$(document).ready(function () {
    $('#left .main ul > li span')
        .html("+")
        .filter(':first')
        .html("-");

    $('#left .main ul > li ul')
    .click(function (e) {
        e.stopPropagation();
    })
    .filter(':not(:first)')
    .hide();

    $('#left .main ul > li').click(function () {
        var selfClick = $(this).find('ul:first').is(':visible');
        if (selfClick) {
            return;
        }
        $(this)
            .parent()
            .find('> li ul:visible')
            .slideToggle()
            .parent()
            .find("span")
            .html("+");

        $(this)
            .find('ul:first')
            .stop(true, true)
            .slideToggle()
            .parent()
            .find("span")
            .html("-");
    });
});
