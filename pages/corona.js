import React from 'react'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import {Markdown} from 'portal/components/Parser'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store'
import useSWR from 'portal/utils/swr'
import Carousel from 'portal/components/Carousel'
import dynamic from 'next/dynamic'
import {connect} from 'react-redux'
import {styled} from '@mui/material/styles'
import {
    Typography,
    CircularProgress,
    Accordion,
    AccordionDetails,
    AccordionSummary
} from '@mui/material'
import {ExpandMore} from '@mui/icons-material'

export const getServerSideProps = wrapper()

const question=[
    "Apakah Coronavirus dan COVID-19?",
    "Apakah COVID-19 sama seperti SARS?",
    "Apa saja gejala COVID-19?",
    "Seberapa bahayanya COVID-19?",
    "Bagaimana manusia bisa terinfeksi COVID-19?",
    "Apakah COVID-19 dapat ditularkan dari orang yang tidak bergejala?",
    "Apakah virus penyebab COVID-19 dapat ditularkan melalui udara?",
    "Bisakah manusia terinfeksi COVID-19 dari hewan?",
    "Bisakah hewan peliharaan menyebarkan COVID-19?",
    "Berapa lama virus ini bertahan di permukaan benda?",
    "Apakah sudah ada vaksin untuk COVID-19?",
    "Apakah antibiotik efektif dalam mencegah dan mengobati COVID-19?",
    "Siapa saja yang berisiko terinfeksi COVID-19?",
    "Manakah yang lebih rentan terinfeksi COVID-19? Apakah orang yang lebih tua, atau orang yang lebih muda?",
    "Bagaimana membedakan antara sakit akibat COVID-19, dengan influenza biasa?",
    "Berapa lama waktu yang diperlukan sejak tertular/terinfeksi hingga muncul gejala penyakit infeksi COVID-19?",
    "Amankah jika kita menerima paket barang dari Cina atau dari negara lain yang melaporkan virus ini?",
    "Apakah sdah ada pembatasan untuk berpergian ke Cina dan negara terjangkit lainnya?",
    "Bagaimana cara mencegah penularan virus corona?",
    "Apakah saya harus selalu menggunakan masker?",
    "Haruskah saya khawatir terhadap penyakit COVID-19 ini?",
    "Dalam kondisi sudah ada kasus di Indonesia, apakah aman bagi saya untuk bepergian?",
    "Saya akan bepergian ke luar negeri untuk sesuatu yang mendesak, apakah saya dapat memperoleh Surat Keterangan Bebas COVID-19? Dimana?",
    "Dimanakah saya bisa mendapatkan media edukasi dan informasi serta situasi perkembangan COVID-19?"
]
const answer=[
    "Coronavirus merupakan keluarga besar virus yang menyebabkan penyakit pada manusia dan hewan. Pada manusia biasanya menyebabkan penyakit infeksi saluran pernapasan, mulai flu biasa hingga penyakit yang serius seperti Middle East Respiratory Syndrome (MERS) dan Sindrom Pernafasan Akut Berat/ Severe Acute Respiratory Syndrome (SARS).\n\nCoronavirus jenis baru yang ditemukan pada manusia sejak kejadian luar biasa muncul di Wuhan Cina, pada Desember 2019, kemudian diberi nama Severe Acute Respiratory Syndrome Coronavirus 2 (SARS-COV2), dan menyebabkan penyakit Coronavirus Disease-2019 (COVID-19).",
    "COVID-19 disebabkan oleh SARS-COV2 yang termasuk dalam keluarga besar coronavirus yang sama dengan penyebab SARS pada tahun 2003, hanya berbeda jenis virusnya.\n\nGejalanya mirip dengan SARS, namun angka kematian SARS (9,6%) lebih tinggi dibanding COVID-19 (kurang dari 5%), walaupun jumlah kasus COVID-19 jauh lebih banyak dibanding SARS. COVID-19 juga memiliki penyebaran yang lebih luas dan cepat ke beberapa negara dibanding SARS.",
    "Gejala umum berupa demam ≥38&#8451;, batuk kering, dan sesak napas. Jika ada orang yang dalam 14 hari sebelum muncul gejala tersebut pernah melakukan perjalanan ke negara terjangkit, atau pernah merawat/kontak erat dengan penderita COVID-19, maka terhadap orang tersebut akan dilakukan pemeriksaan laboratorium lebih lanjut untuk memastikan diagnosisnya.",
    "Seperti penyakit pernapasan lainnya, COVID-19 dapat menyebabkan gejala ringan termasuk pilek, sakit tenggorokan, batuk, dan demam. Sekitar 80% kasus dapat pulih tanpa perlu perawatan khusus. Sekitar 1 dari setiap 6 orang mungkin akan menderita sakit yang parah, seperti disertai pneumonia atau kesulitan bernafas, yang biasanya muncul secara bertahap.\n\nWalaupun angka kematian penyakit ini masih rendah (sekitar 3%), namun bagi orang yang berusia lanjut, dan orang-orang dengan kondisi medis yang sudah ada sebelumnya (seperti diabetes, tekanan darah tinggi dan penyakit jantung), mereka biasanya lebih rentan untuk menjadi sakit parah. Melihat perkembangan hingga saat ini, lebih dari 50% kasus konfirmasi telah dinyatakan membaik, dan angka kesembuhan akan terus meningkat.",
    "Seseorang dapat terinfeksi dari penderita COVID-19. Penyakit ini dapat menyebar melalui tetesan kecil (droplet) dari hidung atau mulut pada saat batuk atau bersin. Droplet tersebut kemudian jatuh pada benda di sekitarnya. Kemudian jika ada orang lain menyentuh benda yang sudah terkontaminasi dengan droplet tersebut, lalu orang itu menyentuh mata, hidung atau mulut (segitiga wajah), maka orang itu dapat terinfeksi COVID-19.\n\nAtau bisa juga seseorang terinfeksi COVID-19 ketika tanpa sengaja menghirup droplet dari penderita. Inilah sebabnya mengapa kita penting untuk menjaga jarak hingga kurang lebih satu meter dari orang yang sakit.\n\nSampai saat ini, para ahli masih terus melakukan penyelidikan untuk menentukan sumber virus, jenis paparan, dan cara penularannya. Tetap pantau sumber informasi yang akurat dan resmi mengenai perkembangan penyakit ini.",
    "Cara penularan utama penyakit ini adalah melalui tetesan kecil (droplet) yang dikeluarkan pada saat seseorang batuk atau bersin. Saat ini WHO menilai bahwa risiko penularan dari seseorang yang tidak bergejala COVID-19 sama sekali sangat kecil kemungkinannya. Namun, banyak orang yang teridentifikasi COVID-19 hanya mengalami gejala ringan seperti batuk ringan, atau tidak mengeluh sakit, yang mungkin terjadi pada tahap awal penyakit.\n\nSampai saat ini, para ahli masih terus melakukan penyelidikan untuk menentukan periode penularan atau masa inkubasi COVID-19. Tetap pantau sumber informasi yang akurat dan resmi mengenai perkembangan penyakit ini.",
    "Tidak. Hingga saat ini penelitian menyebutkan bahwa virus penyebab COVID-19 ditularkan melalui kontak dengan tetesan kecil (droplet) dari saluran pernapasan.",
    "COVID-19 disebabkan oleh salah satu jenis virus dari keluarga besar Coronavirus, yang umumnya ditemukan pada hewan. Sampai saat ini sumber hewan penular COVID-19 belum diketahui, para ahli terus menyelidiki berbagai kemungkinan jenis hewan penularnya.",
    "Saat ini, belum ditemukan bukti bahwa hewan peliharaan seperti anjing atau kucing dapat terinfeksi virus COVID-19.\n\nNamun, akan jauh lebih baik untuk selalu mencuci tangan dengan sabun dan air setelah kontak dengan hewan peliharaan.\nKebiasaan ini dapat melindungi Anda terhadap berbagai bakteri umum seperti E.coli dan Salmonella yang dapat berpindah antara hewan peliharaan dan manusia.",
    "Sampai saat ini belum diketahui dengan pasti berapa lama COVID-19 mampu bertahan di permukaan suatu benda, meskipun studi awal menunjukkan bahwa COVID-19 dapat bertahan hingga beberapa jam, tergantung jenis permukaan, suhu, atau kelembaban lingkungan. Namun disinfektan sederhana dapat membunuh virus tersebut sehingga tidak mungkin menginfeksi orang lagi.\n\nDan membiasakan cuci tangan dengan air dan sabun, atau hand-rub berbasis alkohol, serta hindari menyentuh mata, mulut atau hidung (segitiga wajah) lebih efektif melindungi diri Anda.",
    "Vaksin untuk mencegah infeksi COVID-19 sedang dalam tahap pengembangan/uji coba.",
    "Tidak, antibiotik hanya bekerja untuk melawan bakteri, bukan virus. Oleh karena COVID-19 disebabkan oleh virus, maka antibiotik tidak bisa digunakan sebagai sarana pencegahan atau pengobatan. Namun, jika Anda dirawat di rumah sakit dan didiagnosis COVID-19, Anda mungkin akan diberikan antibiotik, karena seringkali terjadi infeksi sekunder yang disebabkan bakteri.",
    "Orang yang tinggal atau bepergian di daerah di mana virus COVID-19 bersirkulasi sangat mungkin berisiko terinfeksi. Mereka yang terinfeksi adalah orang-orang yang dalam 14 hari sebelum muncul gejala melakukan perjalanan dari negara terjangkit, atau yang kontak erat, seperti anggota keluarga, rekan kerja atau tenaga medis yang merawat pasien sebelum mereka tahu pasien tersebut terinfeksi COVID-19.\n\nPetugas kesehatan yang merawat pasien yang terinfeksi COVID-19 berisiko lebih tinggi dan harus konsisten melindungi diri mereka sendiri dengan prosedur pencegahan dan pengendalian infeksi yang tepat.",
    "Tidak ada batasan usia orang-orang dapat terinfeksi oleh coronavirus ini (COVID-19). Namun orang yang lebih tua, dan orang-orang dengan kondisi medis yang sudah ada sebelumnya (seperti asma, diabetes, penyakit jantung, atau tekanan darah tinggi) tampaknya lebih rentan untuk menderita sakit parah.",
    "Orang yang terinfeksi COVID-19 dan influenza akan mengalami gejala infeksi saluran pernafasan yang sama, seperti demam, batuk dan pilek. Walaupun gejalanya sama, tapi penyebab virusnya berbeda-beda, sehingga kita sulit mengidentifikasi masing-masing penyakit tersebut. Pemeriksaan medis yang akurat disertai rujukan pemeriksaan laboratorium sangat diperlukan untuk mengonfirmasi apakah seseorang terinfeksi COVID-19.\n\nBagi setiap orang yang menderita demam, batuk, dan sulit bernapas sangat direkomendasikan untuk segera mencari pengobatan, dan memberitahukan petugas kesehatan jika mereka telah melakukan perjalanan dari wilayah terjangkit dalam 14 hari sebelum muncul gejala, atau jika mereka telah melakukan kontak erat dengan seseorang yang sedang menderita gejala infeksi saluran pernafasan.",
    "Waktu yang diperlukan sejak tertular/terinfeksi hingga muncul gejala disebut masa inkubasi. Saat ini masa inkubasi COVID-19 diperkirakan antara 1-14 hari, dan perkiraan ini dapat berubah sewaktu-waktu sesuai perkembangan kasus.",
    "Ya, aman. Orang yang menerima paket tidak berisiko tertular virus COVID-19. Dari pengalaman dengan coronavirus lain, kita tahu bahwa jenis virus ini tidak bertahan lama pada benda mati, seperti surat atau paket.",
    "Sejak 5 Februari 2020, Indonesia telah memberlakukan pembatasan perjalanan ke Cina berupa penghentian sementara penerbangan dari dan ke Cina.\nPada tanggal 5 Maret 2020, Indonesia juga memberlakukan pelarangan transit atau masuk ke Indonesia bagi pelaku perjalanan yang dalam 14 hari sebelumnya datang dari wilayah berikut:\n\n*   Iran : Tehran, Qom, Gilan\n*   Italia : Wilayah Lombardi, Veneto, Emilia Romagna, Marche dan Piedmont\n*   Korea Selatan : Kota Daegu dan Propinsi Gyeongsangbuk-do.",
    "Beberapa cara yang bisa dilakukan untuk mencegah penularan virus ini adalah:\n\n*   Menjaga kesehatan dan kebugaran agar stamina tubuh tetap prima dan sistem imunitas / kekebalan tubuh meningkat.\n*   Mencuci tangan dengan benar secara teratur menggunakan air dan sabun atau _hand-rub_ berbasis alkohol. Mencuci tangan sampai bersih selain dapat membunuh virus yang mungkin ada di tangan kita, tindakan ini juga merupakan salah satu tindakan yang mudah dan murah. Sekitar 98% penyebaran penyakit bersumber dari tangan. Karena itu, menjaga kebersihan tangan adalah hal yang sangat penting.\n*   Ketika batuk dan bersin, tutup hidung dan mulut Anda dengan tisu atau lengan atas bagian dalam (bukan dengan telapak tangan).\n*   Hindari kontak dengan orang lain atau bepergian ke tempat umum.\n*   Hindari menyentuh mata, hidung dan mulut (segitiga wajah). Tangan menyentuh banyak hal yang dapat terkontaminasi virus. Jika kita menyentuh mata, hidung dan mulut dengan tangan yang terkontaminasi, maka virus dapat dengan mudah masuk ke tubuh kita.\n*   Gunakan [masker dengan benar](https://infeksiemerging.kemkes.go.id/warta-infem/cara-memakai-masker-dan-cuci-tangan-yang-benar/) hingga menutupi mulut dan hidung ketika Anda sakit atau saat berada di tempat umum.\n*   Buang tisu dan masker yang sudah digunakan ke tempat sampah dengan benar, lalu cucilah tangan Anda.\n*   Menunda perjalanan ke daerah/ negara dimana virus ini ditemukan.\n*   Hindari bepergian ke luar rumah saat Anda merasa kurang sehat, terutama jika Anda merasa demam, batuk, dan sulit bernapas. Segera hubungi petugas kesehatan terdekat, dan mintalah bantuan mereka. Sampaikan pada petugas jika dalam 14 hari sebelumnya Anda pernah melakukan perjalanan terutama ke negara terjangkit, atau pernah kontak erat dengan orang yang memiliki gejala yang sama. Ikuti arahan dari petugas kesehatan setempat.\n*   Selalu pantau perkembangan penyakit COVID-19 dari sumber resmi dan akurat. Ikuti arahan dan informasi dari petugas kesehatan dan Dinas Kesehatan setempat. Informasi dari sumber yang tepat dapat membantu Anda melindungi dari Anda dari penularan dan penyebaran penyakit ini.",
    "Pemakaian masker hanya bagi orang yang memiliki gejala infeksi pernapasan (batuk atau bersin), mencurigai infeksi COVID-19 dengan gejala ringan, mereka yang merawat orang yang bergejala seperti demam dan batuk, dan para petugas kesehatan.\n\nCara yang paling efektif untuk melindungi diri dan orang lain dari penularan COVID-19 adalah mencuci tangan secara teratur, tutup mulut saat batuk dengan lipatan siku atau tisu, dan jaga jarak minimal satu meter dari orang yang bersin atau batuk.",
    "Jika Anda tidak berada di wilayah terjangkit COVID-19, atau jika Anda tidak melakukan perjalanan dari salah satu wilayah tersebut, atau tidak melakukan kontak dekat dengan seseorang yang memiliki gejala COVID-19 atau merasa kurang sehat, kecil kemungkinan Anda untuk tertular COVID-19.\n\nNamun, dapat dimengerti bahwa Anda mungkin merasa stres dan cemas tentang situasi yang terjadi saat ini. Tetaplah tenang dan jangan panik. Carilah informasi yang benar dan akurat tentang perkembangan COVID-19 agar Anda mengetahui situasi wilayah Anda dan Anda dapat mengambil tindakan pencegahan yang wajar.\n\nJika Anda berada di wilayah terjangkit COVID-19, Anda harus serius menghadapi risiko tersebut. Selalu jaga kesehatan dan perhatikan informasi dan saran dari pihak kesehatan yang berwenang.",
    "Tentu saja aman, namun tetap memperhatikan kesehatan dan kebersihan diri. Pakailah masker jika Anda kurang sehat atau berada di kerumunan, selalu cuci tangan setelah memegang benda atau berjabat tangan.",
    "Untuk kondisi saat ini, seseorang belum bisa diberikan surat keterangan bebas COVID-19, karena kita tidak pernah tahu apakah dia pernah kontak dengan orang yang sakit COVID-19.",
    "Informasi tentang media KIE atau situasi perkembangan COVID-19, dapat diakses melalui:\n\n* Halo Kemenkes : **1500567**\n* Hotline Emergency Operation Center_ (EOC): **119** atau **(021) 5210411** atau **081212123119**\n* Twitter : [@KemenkesRI](https://twitter.com/KemenkesRI)\n* Facebook : [@KementerianKesehatanRI](https://www.facebook.com/KementerianKesehatanRI/)\n*   Instagram: [@kemenkes_ri](https://www.instagram.com/kemenkes_ri)\n*   Website :\n\t*   [who.int](https://www.who.int/emergencies/diseases/novel-coronavirus-2019)\n\t*   [covid19.go.id](https://covid19.go.id)\n\t*   [infeksiemerging.kemkes.go.id](http://infeksiemerging.kemkes.go.id/)"
]

const Div = styled('div')(({theme})=>({
    marginTop:10,
    [theme.breakpoints.down('sm')]: {
        paddingLeft:theme.spacing(2),
        paddingRight:theme.spacing(2)
    },
    [theme.breakpoints.up('sm')]: {
        paddingLeft:theme.spacing(3),
        paddingRight:theme.spacing(3)
    },
}))
const Map=dynamic(()=>import('portal/components/Map/Corona'),
    {
        ssr:false,
        loading:()=>(
            <div style={{margin:'20px auto',textAlign:'center'}}>
                <CircularProgress thickness={5} size={50}/>
            </div>
        )
    }
);
const Corona=({classes,err,toggleDrawer})=>{
    if(err) return <ErrorPage statusCode={err} />

    const [expanded, setExpanded] = React.useState(false);
    const {data,error}=useSWR(`/v1/internal/corona?with_data=true`);
    const handleExpanded = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    React.useEffect(()=>{
        setTimeout(()=>{
            const rs=document.getElementById('coronaRS'),
            iframe=document.getElementById('iframeCoronaRS')
            iframe.setAttribute('height',`${(rs?.clientHeight||rs?.offsetHeight)}px`)
            iframe.setAttribute('width',`${(rs?.clientWidth||rs?.offsetWidth)}px`)
        },1000)
    },[toggleDrawer])

    return(
        <Header iklan 
        desc={`Coronavirus Disease (COVID-19) Information. Get the last update about coronavirus cases globally.`}
        title="Coronavirus Disease (COVID-19)"
        keyword={`Corona, Korona, Virus, Information, Wuhan, Diseases, COVID-19, nCoV-2019, FAQ, Mencegah corona,selalu menggunakan masker?,apakah aman bagi saya untuk bepergian?,situasi perkembangan COVID-19`}
        active='corona'
        navTitle="COVID 19"
        canonical="/corona"
        >   
            <Map error={error} data={data} />
            <PaperBlock title="Rumah Sakit COVID-19 Indonesia" noPadding whiteBg>
                <div>
                    <div id='coronaRS' style={{position:'relative',width:'100%',height:0,paddingBottom:'56.25%'}}>
                        <iframe id='iframeCoronaRS' src="https://covid19.geosai.my.id/" width={560} height={315} frameBorder={0} allowFullScreen scrolling="no"></iframe>
                    </div>
                </div>
                <Div>
                    <Typography>Sumber: geosai.my.id</Typography>
                </Div>
            </PaperBlock>
            {!error && !data ? (
                <PaperBlock title='Recent News about COVID-19' whiteBg>
                    <div style={{margin:'20px auto',textAlign:'center'}}>
                        <CircularProgress thickness={5} size={50}/>
                    </div>
                </PaperBlock>
            ) : error ? (
                <PaperBlock title='Recent News about COVID-19' whiteBg>
                    <div style={{margin:'20px auto',textAlign:'center'}}>
                        <Typography variant="h5">{error}</Typography>
                    </div>
                </PaperBlock>
            ) : (
                <Carousel data={data?.news} title='Recent News about COVID-19' linkParams="/news/[...slug]" asParams="link"
                paperBlock={{
                    toggle:true,
                    initialShow:false,
                }}
                />
            )}
            <PaperBlock title="FAQ Novel Coronavirus" linkColor toggle initialShow={false} whiteBg>
                {question.map((qu,i)=>(
                    <Accordion key={`exspand-faq-${i}`} expanded={expanded === `exspand-faq-${i}`} onChange={handleExpanded(`exspand-faq-${i}`)}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls={`panel${i}bh-content`}
                        >
                            <Typography variant='h6' component='h4'>{i+1}. {qu}</Typography>
                        </AccordionSummary>
                        <AccordionDetails style={{display:'block'}}>
                            <Markdown source={answer[i]} />
                        </AccordionDetails>
                    </Accordion>
                ))}
            </PaperBlock>
        </Header>
    )
}

export default connect(state=>({toggleDrawer:state.toggleDrawer}))(Corona)