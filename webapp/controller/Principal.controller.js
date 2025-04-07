sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/suite/ui/microchart/InteractiveDonutChartSegment"

], (Controller, MessageToast, JSONModel, InteractiveDonutChartSegment) => {
    "use strict";

    return Controller.extend("raccoon.devs.evalproyectos.controller.Principal", {
        onInit() {
            this.cargarProductos()
        },

        cargarProductos: async function () {
            let oModel = this.getOwnerComponent().getModel()
            var that = this;
            oModel.read("/Products", {
                success: function (data) {
                    let oModel = new JSONModel(data);
                    that.getOwnerComponent().setModel(oModel, "modelProductos")

                    const chart = that.byId("donutChart")

                    //Agregar programáticamente cada uno de los productos como un microchart segment
                    let totalItems = 0

                    data.results.forEach(element => {
                        totalItems = totalItems + element.UnitsInStock
                    });

                    data.results.forEach(element => {
                        chart.addSegment(new InteractiveDonutChartSegment({
                            label: element.ProductName,
                            value: (element.UnitsInStock * 100) / totalItems,
                            displayedValue: element.UnitsInStock + "%",
                            color: element.UnitsInStock > 30 ? "Good" : element.UnitsInStock <= 10 ? "Critical" : "Error"
                        }));
                    });



                },
                error: function (error) {
                    console.log(error)
                }
            })
        },

        onNavigationFinished: function (evt) {
            var toPage = evt.getParameter("to");
            MessageToast.show("Navigation to page '" + toPage.getTitle() + "' finished");
        },

        handleNav: function (evt) {
            var navCon = this.byId("navCon");
            var target = evt.getSource().data("target");
            if (target) {
                var animation = this.byId("animationSelect").getSelectedKey();
                navCon.to(this.byId(target), animation);
            } else {
                navCon.back();
            }
        },
        press: function (oEvent) {
            MessageToast.show("The Interactive Donut Chart is pressed.");
        },

        /**
         * Creates a message for a selection change event on the chart
         *
         * @private
         */
        onSelectionChanged: function (oEvent) {
            var oSegment = oEvent.getParameter("segment");
            MessageToast.show("The selection changed: " + oSegment.getLabel() + " " + ((oSegment.getSelected()) ? "selected" : "not selected"));
        }
    });
});