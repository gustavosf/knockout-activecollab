
function User(data) {
    this.name = ko.observable(data.name);
    this.id = ko.observable(data.id);
}

function UserListViewModel() {
    var self = this;
    self.users = ko.observableArray([]);
    self.selectedUser = ko.observable();

    // Busca a lista de usuários e popula o select
    $.getJSON('proxy.php/people/1/users', {}, function (allData) {
        console.log(allData);
        var mappedUsers = $.map(allData, function(item) { return new User(item) });
        self.users(mappedUsers);
    });

    self.showGraph = function() {
        $.getJSON('proxy.php/dashboard/punchclock/refresh', {
            'user_id': self.selectedUser().id(),
            'start_range': '1 Jan 2015',
            'end_range': '5 Feb 2015'
        }, function (resp) {
            var log = {}, total = 0;

            $.each(resp.projects, function (i, p) {
                if (!$.isArray(p)) return;
                $.each(p, function (j, d) {
                    var time = d.valueday.match(/(\d+):(\d+)/),
                        minutes = parseInt(time[1]) * 60 + parseInt(time[2]),
                        name = d.project.nameProject ? d.project.nameProject : d.project.name

                    log[name] = (log[name] ? log[name] : 0) + minutes;
                    total = total + minutes;
                });
            });

            log = $.map(log, function (minutes, name) {
                return [[name, (minutes / total * 100)]];
            });

            $('#container').highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: 'User activity'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Browser share',
                    data: log
                }]
            });


        });
    }
}

/* KnockOut main binding */
ko.applyBindings(new UserListViewModel());