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


                    for (let index = 0; index < 4; index++) {
                        totalItems = totalItems + data.results[index].UnitsInStock
                    }

                    for (let index = 0; index < 4; index++) {
                        chart.addSegment(new InteractiveDonutChartSegment({
                            label: data.results[index].ProductName,
                            value: Math.round((data.results[index].UnitsInStock * 100)) / totalItems,
                            displayedValue: Math.round((data.results[index].UnitsInStock * 100) / totalItems) + "%",
                            color: data.results[index].UnitsInStock > 30 ? "Good" : data.results[index].UnitsInStock <= 10 ? "Critical" : "Error"
                        }));

                    }


                },
                error: function (error) {
                    console.log(error)
                }
            })
        },

        onPress: function (oEvent) {
            MessageToast.show("Pressed on " + oEvent.getSource().getSender());
        },

        onActionPressed: function (oEvent) {
            var sAction = oEvent.getSource().getKey();

            if (sAction === "delete") {
                this.removeItem(oEvent.getParameter("item"));
                MessageToast.show("Item deleted");
            } else {
                MessageToast.show("Action \"" + sAction + "\" pressed.");
            }
        },

        removeItem: function (oFeedListItem) {
            var sFeedListItemBindingPath = oFeedListItem.getBindingContext().getPath();
            var sFeedListItemIndex = sFeedListItemBindingPath.split("/").pop();
            var aFeedCollection = this.getView().getModel().getProperty("/EntryCollection");

            aFeedCollection.splice(sFeedListItemIndex, 1);
            this.getView().getModel().setProperty("/EntryCollection", aFeedCollection);
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