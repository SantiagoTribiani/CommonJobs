﻿$(function () {
    var rowTemplate = _.template($("#row-template").text());
    var whileTrue = function (getData, callback, take, skip) {
        skip = skip || 0;
        take = take || ViewData.bsize;
        getData(take, skip, function (data) {
            callback(data, take, skip) && whileTrue(getData, callback, take, skip + take);
        });
    };

    var $table = $('#absences-table');
    var currentYear = ViewData.currentYear;
    var year = ViewData.year;
    var months = ViewData.Months;

    var columns = [
            DataTablesHelpers.column.link(
                DataTablesHelpers.column.fullName(
                    function (data) { return data.employee.LastName; },
                    function (data) { return data.employee.FirstName; }),
                function (data) { return urlGenerator.action("Edit", "Employees", data.employee.Id); },
                {
                    sClass: "cell-name"
                })
            //TODO: Other columns with related abscence date, like employee summary, or something
    ];

    _.each(months, function (days, month) {
        _.each(days, function (day) {
            columns.push({
                bSortable: false,
                sClass: "cell-day" + (day.Weekend ? " weekend" : ""),
                mData: function () {
                    //TODO: day absence data
                    return "";
                }
            });
        })
    });

    var table = $table.dataTable(
    {
        bPaginate: false,
        bAutoWidth: false,
        aoColumns: columns,
        sDom: "<'row-fluid'<'span6'T><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
        oTableTools: {
            aButtons: [
                {
                    sExtends: "print",
                    sButtonText: "Imprimir"
                },
                {
                    sExtends: "copy",
                    sButtonText: "Copiar"
                },
                {
                    sExtends: "pdf",
                    sButtonText: "PDF"
                },
                {
                    sExtends: "csv",
                    sButtonText: "Excel"
                }
		    ]
        }/*,
        fnCreatedRow: function (nRow, aData, iDataIndex) {
            $(nRow).find("td").first().nextAll().addClass("center");
            $(nRow).find(".vacation-list").popover({
                title: 'Detalle',
                placement: "top"
            });
        },*/
    });

    
    //new FixedHeader(table);

    whileTrue(
        function (take, skip, callback) {
            jQuery.getJSON(urlGenerator.action("AbsenceBunch", "Absences"), { year: year, Skip: skip, Take: take }, function (data, textStatus, jqXHR) {
                callback(data);
            });
        },
        function (data, take, skip) {
            //  le.log(data);
            $table.dataTable().fnAddData(
                _.map(data.Items, function (employee) {
                    //console.log(employee);
                    //Prepare absence data
                    return {
                        employee: employee
                    };
                }));


            var thereAreMore = skip + take < data.TotalResults;

            return thereAreMore;
        });
});