"use client"
import { Document, Font, Page, StyleSheet, Text } from "@react-pdf/renderer";
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 35,
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#e8e8e8',
    width: "100%",
    border: "1px solid #000",
    textAlign: "center"
  },
  mainContainer: {
  },
  secContainer: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
  },
  firstSubContainer: {
    margin: 10,
    flexDirection: 'column',
    border: "1px solid #000",
    borderRadius: "15px",
    padding: "10px",
    width: "80%"
  },
  subContainer: {
    margin: 10,
    flexDirection: 'column',
    border: "1px solid #000",
    borderRadius: "15px",
    padding: "10px",
    width: "100%"
  },
  customerDataContainer: {
    flexDirection: 'row',
    padding: "5px",
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: "#e8e8e8",
    margin: "2px",
    border: "1px solid #000",
    borderRadius: "15px",
  },
  preTotalContainer: {
    flexDirection: 'row',
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: "#e8e8e8",
    marginTop: "10px"
  },
  totalContainer: {
    flexDirection: 'row',
    padding: "5px",
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: "#e8e8e8",
    border: "1px solid #000",
    alignSelf: "flex-end",
    marginTop: "10px"
  },
  payMethodContainer: {
    fontSize: 12,
    width: "100%",
    border: "1px solid #000",
    padding: "4px",
    marginTop: "10px",
    borderRadius: "15px"
  },
  signContainer: {
    flexDirection: "row",
    fontSize: 12,
    width: "100%",
    marginTop: "10px",
    borderRadius: "15px"
  },
  signSubContainer: {
    fontSize: 12,
    border: "1px solid #000",
    padding: "4px",
    borderRadius: "15px",
    height: "100px",
    marginTop: "15px"
  },
  label: {
    fontSize: 12,
    maxWidth: "15vh",
  },
  totalLabel: {
    fontSize: 12,
  },
  signLabel: {
    fontSize: 8,
    padding: "5px",
    borderBottom: 1,
    borderColor: 'black',
    paddingBottom: 5,
  },
  productsLabel: {
    display: "inline-block",
    lineHeight: 1,
    verticalAlign: "baseline",
    backgroundColor: "#e8e8e8",
    fontSize: 12,
    maxWidth: "15vh",
    fontWeight: 'bold',
    padding: "4px",
    borderRadius: "5px",
    marginBottom: "5px"
  },
  segment: {
    fontSize: 12,
    maxWidth: "15vh",
  },
  totalSegment: {
    fontSize: 12,
    maxWidth: "15vh",
    paddingRight: "12px"
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    backgroundColor: '#e8e8e8',
    display: "flex",
    flexDirection: "row",
  },
  tableCellHeader: {
    fontSize: 12,
    border: "1px solid #000",
    padding: "5px",
    width: "100%",
    textAlign: "center"
  },
  firstTableCellHeader: {
    fontSize: 12,
    border: "1px solid #000",
    padding: "5px",
    minWidth: "35vw",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
  },
  firstTableCell: {
    fontSize: 12,
    border: "1px solid #000",
    padding: "4px",
    minWidth: "35vw",
    alignItems:"center"
  },
  tableCell: {
    display: "flex",
    fontSize: 12,
    padding: "4px",
    border: "1px solid #000",
    width: "100%",
    textAlign: "center",
  },
  totalTableCell: {
    fontSize: 12,
    border: "1px solid #000",
    padding: "4px",
    width: "100%",
    textAlign: "center",
  },
  totalRow: {
    display: "flex",
    flexDirection: "row",
    fontWeight: 'bold',
    marginTop: "10px"
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});

Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf',
});

const SeePDFfile = ({ budget }) => {
  console.log(budget)
  return (
    <PDFViewer style={{ marginTop: "70px", width: "100%", height: "90vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Presupuesto</Text>
          <View style={styles.mainContainer}>
            <View style={styles.secContainer}>
              <View style={styles.firstSubContainer}>
              </View>
              <View style={styles.subContainer}>
                <View style={styles.customerDataContainer}>
                  <Text style={styles.label}>Nombre:</Text>
                  <Text style={styles.segment}>{budget.customerId}</Text>
                </View>
                <View style={styles.customerDataContainer}>
                  <Text style={styles.label}>Direccion:</Text>
                  <Text style={styles.segment}>Bolivia 652</Text>
                </View>
                <View style={styles.customerDataContainer}>
                  <Text style={styles.label}>Provincia: </Text>
                  <Text style={styles.segment}>Cordoba</Text>
                </View>
                <View style={styles.customerDataContainer}>
                  <Text style={styles.label}>Fecha: </Text>
                  <Text style={styles.segment}>{modDate(budget.createdAt)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.table}>
              <View style={[styles.tableHeader]}>
                {PRODUCTSHEADERS.map((header) => (
                  <Text key={header.id} style={header.name === "Nombre" ? styles.firstTableCellHeader : styles.tableCellHeader} textAlign='center'>{header.name}</Text>
                ))}
              </View>
              {budget.products.map((product, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text style={styles.firstTableCell}>{product.name}</Text>
                    <Text style={styles.tableCell}>${product.price}</Text>
                    <Text style={styles.tableCell}>{product.quantity}</Text>
                    <Text style={styles.tableCell}>{product.discount}%</Text>
                    <Text style={styles.tableCell}>${product.total}</Text>
                  </View>
              ))}
              <View style={styles.preTotalContainer}>
                <Text style={styles.firstTableCell}></Text>
                <Text style={styles.totalTableCell}></Text>
                <Text style={styles.totalTableCell}></Text>
                <Text style={styles.totalTableCell}>Total Bruto</Text>
                <Text style={styles.totalTableCell}>${totalSum(budget.products)}</Text>
              </View>
              <View style={styles.preTotalContainer}>
                <Text style={styles.firstTableCell}></Text>
                <Text style={styles.totalTableCell}></Text>
                <Text style={styles.totalTableCell}></Text>
                <Text style={styles.totalTableCell}>I.V.A   21%</Text>
                <Text style={styles.totalTableCell}>{IVA(totalSum(budget.products))}</Text>
              </View>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>TOTAL PRESUPUESTO</Text>
                <Text style={styles.totalSegment}>{totalIVA(totalSum(budget.products))}</Text>
              </View>
            </View>
            <View style={styles.payMethodContainer}>
              <Text style={styles.label}>Forma de pago: </Text>
            </View>
            <View style={styles.signContainer}>
              <View style={styles.signSubContainer}>
                <Text style={styles.signLabel}>Nombre, apellido, y firma de la persona que confeccione el presupuesto. </Text>
              </View>
              <View style={styles.signSubContainer}>
                <Text style={styles.signLabel}>ACEPTO EL PRESUPUESTO. Nombre, apellido, y firma del cliente. </Text>
              </View>
            </View>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      </Document>
    </PDFViewer >
  );
};

export default PDFfile;