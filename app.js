
function User (data) {
    this.name = ko.observable(data.name);
    this.id = ko.observable(data.id);
}

function UserListViewModel () {
    var self = this;
    self.users = ko.observableArray([]);
    self.selectedUser = ko.observable();

    // Busca a lista de usuários e popula o select
    $.getJSON('proxy.php/people/1/users', {}, function (allData) {
        var mappedUsers = $.map(allData, function (item) { return new User(item) });
        self.users(mappedUsers);
    });

    // Gráfico em forma de pizza porcentagens trabalhadas em cada projeto
    self.showPie = function () {

        var range = parseInt($('#range').find(':selected').val()) * 1000 * 60 * 60 * 24,
            end = new Date(),
            start = new Date(end.getTime() - range);

        $.getJSON('proxy.php/dashboard/punchclock/refresh', {
            'user_id': self.selectedUser().id(),
            'start_range': start.getDate() + ' ' + start.toString().split(' ')[1] + ' ' + start.getFullYear(),
            'end_range': end.getDate() + ' ' + end.toString().split(' ')[1] + ' ' + end.getFullYear()
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
                // return [[name, (minutes / total * 100)]];
                return [[name, minutes/60]];
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
                    pointFormat: '{series.name}: <b>{point.total:.1f} hours</b>'
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
                    name: 'User activity',
                    data: log
                }]
            });
        });
    };

    // Gráfico no formato de linha
    self.showTimeline = function () {

        var range = parseInt($('#range').find(':selected').val()) * 1000 * 60 * 60 * 24,
            end = new Date(),
            start = new Date(end.getTime() - range);

        $.getJSON('proxy.php/dashboard/punchclock/refresh', {
            'user_id': self.selectedUser().id(),
            'start_range': start.getDate() + ' ' + start.toString().split(' ')[1] + ' ' + start.getFullYear(),
            'end_range': end.getDate() + ' ' + end.toString().split(' ')[1] + ' ' + end.getFullYear()
        }, function (resp) {
            var log = {}, total = 0, keys = [];
            for (var k in resp.projects) keys.unshift(k);

            $.each(keys, function (k, i) {
                p = resp.projects[i];
                if (!$.isArray(p)) return;
                $.each(p, function (j, d) {
                    var time = d.valueday.match(/(\d+):(\d+)/),
                        minutes = parseInt(time[1]) * 60 + parseInt(time[2]),
                        name = d.project.nameProject ? d.project.nameProject : d.project.name,
                        d = new Date(i).getTime();

                    if (log[name] == undefined) log[name] = {name:name,data:{},total:0};
                    log[name].total += minutes/60;
                    log[name].data[d] = [d, log[name].total];
                });
            });

            var log = $.map(log, function(v, i) {
                v.data = $.map(v.data, function(v2, i2) {
                    return [v2];
                });
                return [v];
            });

            $('#container').highcharts({
                chart: {
                    type: 'spline',
                    zoomType: 'x'
                },
                title: { text: 'User activity' },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x:%e. %b}: {point.y:.1f} hours'
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%e. %b',
                        year: '%b'
                    },
                    title: {
                        text: 'Date'
                    }
                },
                yAxis: { title: { text: 'Activity' } },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        },
                        enableMouseTracking: false
                    }
                },
                series: log
            });
        });
    }
}

/* KnockOut main binding */
ko.applyBindings(new UserListViewModel());