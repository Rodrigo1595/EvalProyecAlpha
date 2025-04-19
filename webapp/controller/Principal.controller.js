sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/suite/ui/microchart/InteractiveDonutChartSegment",
    "sap/ui/core/ResizeHandler",
    'sap/viz/ui5/format/ChartFormatter',
    'sap/viz/ui5/api/env/Format',
    'sap/ui/model/BindingMode',

], (Controller, MessageToast, JSONModel, InteractiveDonutChartSegment, ResizeHandler, ChartFormatter, Format, BindingMode) => {
    "use strict";

    return Controller.extend("raccoon.devs.evalproyectos.controller.Principal", {
        _resizeHandlerId: null, // Guarda el handler para eliminarlo luego si es necesario

        dataPath: "test-resources/sap/viz/demokit/dataset/milk_production_testing_data/revenue_cost_consume",

        settingsModel: {
            dataset: {
                name: "Dataset",
                defaultSelected: 1,
                values: [{
                    name: "Small",
                    value: "/small.json"
                }, {
                    name: "Medium",
                    value: "/medium.json"
                }, {
                    name: "Large",
                    value: "/large.json"
                }]
            },
            series: {
                name: "Series",
                defaultSelected: 0,
                values: [{
                    name: "1 Series",
                    value: ["Revenue"]
                }, {
                    name: '2 Series',
                    value: ["Revenue", "Cost"]
                }]
            },
            dataLabel: {
                name: "Value Label",
                defaultState: true
            },
            axisTitle: {
                name: "Axis Title",
                defaultState: false
            }
        },

        oVizFrame: null,

        onInit(evt) {
            this.cargarProductos()

            var oGrid = this.getView().byId("demoGrid");

            if (oGrid) {
                // Registrar el ResizeHandler una vez, escuchará siempre los cambios de tamaño
                this._resizeHandlerId = ResizeHandler.register(oGrid, function (oEvent) {
                    var iWidth = oEvent.size.width;

                    if (iWidth <= 480) {
                        // Pantalla extra pequeña (XS)
                        oGrid.removeStyleClass("sapUiSmallMargin");
                        oGrid.addStyleClass("sapUiTinyMargin");

                    } else {
                        // Pantalla normal o grande
                        oGrid.removeStyleClass("sapUiTinyMargin");
                        oGrid.addStyleClass("sapUiSmallMargin");

                    }
                });
            }

            Format.numericFormatter(ChartFormatter.getInstance());
            var formatPattern = ChartFormatter.DefaultPattern;
            // set explored app's demo model on this sample
            var oModel = new JSONModel(this.settingsModel);
            oModel.setDefaultBindingMode(BindingMode.OneWay);
            this.getView().setModel(oModel);

            var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        formatString: formatPattern.SHORTFLOAT_MFD2,
                        visible: true
                    }
                },
                valueAxis: {
                    label: {
                        formatString: formatPattern.SHORTFLOAT
                    },
                    title: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: false
                    }
                },
                title: {
                    visible: false,
                    text: 'Revenue by City and Store Name'
                }
            });
            var dataModel = new JSONModel(this.dataPath + "/medium.json");
            oVizFrame.setModel(dataModel);

            var oPopOver = this.getView().byId("idPopOver");
            oPopOver.connect(oVizFrame.getVizUid());
            oPopOver.setFormatString(formatPattern.STANDARDFLOAT);

            var that = this;
            dataModel.attachRequestCompleted(function () {
                that.dataSort(this.getData());
            });



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

            //Refrescar insumos


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
                navCon.to(this.byId(target), "slide");
            } else {
                navCon.back();
            }
        },
        press: function (oEvent) {
            MessageToast.show("The Interactive Donut Chart is pressed.");
        },
        onSelectionChanged: function (oEvent) {
            var oSegment = oEvent.getParameter("segment");
            MessageToast.show("The selection changed: " + oSegment.getLabel() + " " + ((oSegment.getSelected()) ? "selected" : "not selected"));
        },
        onRevealGrid: function () {
            RevealGrid.toggle("demoGrid", this.getView());
        },

        onExit: function () {
            RevealGrid.destroy("demoGrid", this.getView());
        },

        onPress: function (oEvent) {
            MessageToast.show("Boton navegar a próxima aplicación " + oEvent.getSource().getMetadata().getName());
        },

        handleSwipe: function (evt) {   // register swipe event
            var oSwipeContent = evt.getParameter("swipeContent"), // get swiped content from event
                oSwipeDirection = evt.getParameter("swipeDirection"); // get swiped direction from event
            var msg = "";

            if (oSwipeDirection === "BeginToEnd") {
                // List item is approved, change swipeContent(button) text to Disapprove and type to Reject
                oSwipeContent.setText("Approve").setType("Accept");
                msg = 'Swipe direction is from the beginning to the end (left ro right in LTR languages)';

            } else {
                // List item is not approved, change swipeContent(button) text to Approve and type to Accept
                oSwipeContent.setText("Disapprove").setType("Reject");
                msg = 'Swipe direction is from the end to the beginning (right to left in LTR languages)';
            }
            MessageToast.show(msg);
        },

        handleReject: function (evt) {
            var oList = evt.getSource().getParent();
            oList.removeAggregation("items", oList.getSwipedItem());
            oList.swipeOut();
        },

        dataSort: function (dataset) {
            //let data sorted by revenue
            if (dataset && dataset.hasOwnProperty("milk")) {
                var arr = dataset.milk;
                arr = arr.sort(function (a, b) {
                    return b.Revenue - a.Revenue;
                });
            }
        },
        onAfterRendering: function () {
            var datasetRadioGroup = this.getView().byId('datasetRadioGroup');
            datasetRadioGroup.setSelectedIndex(this.settingsModel.dataset.defaultSelected);

            var seriesRadioGroup = this.getView().byId('seriesRadioGroup');
            seriesRadioGroup.setSelectedIndex(this.settingsModel.series.defaultSelected);
        },
        onDatasetSelected: function (oEvent) {
            if (!oEvent.getParameters().selected) {
                return;
            }
            var datasetRadio = oEvent.getSource();
            if (this.oVizFrame && datasetRadio.getSelected()) {
                var bindValue = datasetRadio.getBindingContext().getObject();
                var dataModel = new JSONModel(this.dataPath + bindValue.value);
                this.oVizFrame.setModel(dataModel);
                var that = this;
                dataModel.attachRequestCompleted(function () {
                    that.dataSort(this.getData());
                });
            }
        },
        onSeriesSelected: function (oEvent) {
            if (!oEvent.getParameters().selected) {
                return;
            }
            var seriesRadio = oEvent.getSource();
            if (this.oVizFrame && seriesRadio.getSelected()) {
                var bindValue = seriesRadio.getBindingContext().getObject();

                var feedValueAxis = this.getView().byId('valueAxisFeed');
                this.oVizFrame.removeFeed(feedValueAxis);
                feedValueAxis.setValues(bindValue.value);
                this.oVizFrame.addFeed(feedValueAxis);
                var that = this;
                this.oVizFrame.getModel().attachRequestCompleted(function () {
                    that.dataSort(this.getData());
                });
            }
        },
        onDataLabelChanged: function (oEvent) {
            if (this.oVizFrame) {
                this.oVizFrame.setVizProperties({
                    plotArea: {
                        dataLabel: {
                            visible: oEvent.getParameter('state')
                        }
                    }
                });
            }
        },
        onAxisTitleChanged: function (oEvent) {
            if (this.oVizFrame) {
                var state = oEvent.getParameter('state');
                this.oVizFrame.setVizProperties({
                    valueAxis: {
                        title: {
                            visible: state
                        }
                    },
                    categoryAxis: {
                        title: {
                            visible: state
                        }
                    }
                });
            }
        }


    });
});