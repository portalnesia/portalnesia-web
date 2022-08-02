import React from 'react'
import {Header,PaperBlock} from 'portal/components'
import Link from 'next/link'
import {Accordion,AccordionDetails,AccordionSummary,Typography,Grid} from '@mui/material'
import {ExpandMore} from '@mui/icons-material'
//import {connect} from 'react-redux';
import db from 'portal/utils/db'
import {wrapper} from 'portal/redux/store';
import ErrorPage from 'portal/pages/_error'

export const getServerSideProps = wrapper()

const TwitterDocs=({err})=>{
    if(err) return <ErrorPage statusCode={err} />

    const [expanded, setExpanded] = React.useState(false);
    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };
    return(
        <Header title="Twitter Docs" desc="Documentation to Tweeting via @Portalnesia1 twitter accounts." noSidebar>
            <Grid container justifyContent='center' spacing={2}>
                <Grid item xs={12} md={10} lg={8}>
                    <PaperBlock title="About" linkColor whiteBg>
                        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel1bh-content"
                            >
                                <Typography variant='h6' component='h4'>Tentang Fitur Tweet Melalui @Portalnesia1</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <Typography gutterBottom>
                                    Fitur ini lebih dikenal dengan sebutan Menfess (Mention Confess), yaitu sebuah pesan atau hanya sekedar kata-kata yg ingin disampaikan untuk 'seseorang' tanpa memberitahukan identitas si pengirim.
                                </Typography>
                                <Typography gutterBottom>
                                Pesan anda, akan dikirimkan sebagai tweet dari kami sebagai anonim. Isinya? anda atur sendiri!
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel2bh-content"
                            >
                                <Typography variant='h6' component='h4'>Cara Kerja Fitur</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <ul>
                                    <li><Typography>Anda mengirim DM dengan kata kunci ke akun twitter <a className="underline" href="/tw" target="_blank">@Portalnesia1</a>, akun official telegram <a className="underline" href="/tg" target="_blank">@portalnesia_bot</a> atau akun official line <a className="underline" href="/ln" target="_blank">@540ytcnc</a></Typography></li>
                                    <li><Typography>Pesan anda kami terima dan kami proses.</Typography></li>
                                    <li><Typography>Dalam 5 menit, pesan anda tadi akan terposting otomatis oleh sistem di akun kami.</Typography></li>
                                    <li><Typography>Selengkapnya, silahkan baca dokumentasi kami.</Typography></li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel3bh-content"
                            >
                                <Typography variant='h6' component='h4'>Hubungi Kami</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <Typography>Twitter: <a className="underline" href="/tw" target="_blank">@Portalnesia1</a></Typography>
                                <Typography>Line Official: <a className="underline" href="/ln" target="_blank">Portalnesia</a> (@540ytcnc)</Typography>
                                <Typography>Telegram: <a className="underline" href="/tg" target="_blank">@portalnesia_bot</a></Typography>
                                <Typography>Facebook: <a className="underline" href="/fb" target="_blank">Portalnesia</a></Typography>
                                <Typography>Email: <a className="underline" href="mailto:support@portalnesia.com">support@portalnesia.com</a></Typography>
                                <Typography>Website: <Link href='/' passHref><a className="underline">portalnesia.com</a></Link></Typography>
                            </AccordionDetails>
                        </Accordion>
                    </PaperBlock>
                    <PaperBlock title="Documentation" linkColor whiteBg>
                        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel4bh-content"
                            >
                                <Typography variant='h6' component='h4'>Syarat Mengirim Tweet Menggunakan @Portalnesia1</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <ul>
                                    <li><Typography>Mempunyai akun twitter dan akun twitter yang digunakan untuk mengirim DM sudah mem-follow akun <a className="underline" href="/tw" target="_blank">@Portalnesia1</a></Typography></li>
                                    <li><Typography>Akun line yang digunakan sudah menambahkan <a className="underline" href="/ln" target="_blank">Portalnesia</a> sebagai teman.</Typography></li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel4bh-content"
                            >
                                <Typography variant='h6' component='h4'>Cara Mengirim Tweet</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <ul>
                                    <li>
                                        <Typography>Mengirim Tweet Menggunakan Akun Twitter:</Typography>
                                        <ol>
                                            <li><Typography>Kirim teks yang ingin di tweet melalui DIRECT MESSAGE (DM) ke akun <a className="underline" href="/tw" target="_blank">@Portalnesia1</a> dengan menggunakan kata kunci <code>[PN]</code> diawal teks. Contoh: <code>[PN] Guys tanya dong, cara cepet kaya tapi gak ngapa-ngapain gimana ya?</code></Typography></li>
                                            <li><Typography>Apabila kami membalas DM anda dengan <code>[BOT] Your message is queued.</code> maka pesan anda sudah kami terima dan jika tidak ada kendala, akan diposting dalam 5 menit.</Typography></li>
                                        </ol>
                                    </li>
                                    <li>
                                        <Typography>Mengirim Tweet Menggunakan Akun Line Atau Telegram:</Typography>
                                        <ol>
                                            <li><Typography>Kirim teks yang ingin di tweet melalui PERSONAL MESSAGE ke akun official telegram <a className="underline" href="/tg" target="_blank">@portalnesia_bot</a> atau akun official line <a className="underline" href="/ln" target="_blank">@540ytcnc</a>, dengan menggunakan kata kunci <code>[PN]</code> diawal teks. Contoh: <code>[PN] Guys tanya dong, cara cepet kaya tapi gak ngapa-ngapain gimana ya?</code></Typography></li>
                                            <li><Typography>Ikuti instruksi selanjutnya dari akun official kami.</Typography></li>
                                            <li><Typography>Apabila kami membalas DM anda dengan <code>[BOT] Your message is queued.</code> maka pesan anda sudah kami terima dan jika tidak ada kendala, akan diposting dalam waktu kurang lebih 5 menit.</Typography></li>
                                        </ol>
                                    </li>
                                    <li><Typography>Jumlah karakter total <strong>TIDAK BOLEH</strong> melebihi 200 kata (termasuk kata kunci). Jika terhitung melebihi 200 karakter, maka teks tersebut tidak akan dikirim.</Typography></li>
                                    <li><Typography>Jika tetap melebihi 200 karakter, diharapkan mengirim gambar (contoh gambar note berisi tulisan teks yang melebihi 200 karakter).</Typography></li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel6bh-content"
                            >
                                <Typography variant='h6' component='h4'>Jenis Pesan Yang Dapat Kami Terima</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <ul>
                                    <li><Typography>Dengan menggunakan akun twitter, telegram, maupun line, anda dapat mengirim pesan berupa teks dan gambar, tetapi</Typography></li>
                                    <li><Typography>Jika anda ingin mengirim video, anda harus mengirimnya melalui akun official <a className="underline" href="/tg" target="_blank">telegram</a> kami atau akun official <a className="underline" href="/ln" target="_blank">line</a> (Portalnesia) kami</Typography></li>
                                    <li><Typography>Ukuran file video <strong>TIDAK BOLEH</strong> lebih besar dari 5MB.</Typography></li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded === 'panel7'} onChange={handleChange('panel7')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel7bh-content"
                            >
                                <Typography variant='h6' component='h4'>Peraturan Mengirim Tweet</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <ul>
                                    <li>
                                        <Typography>Teks tidak boleh mengandung unsur:</Typography>
                                        <ol>
                                            <li><Typography>Promosi.</Typography></li>
                                            <li><Typography>Kata tidak jelas. Contoh: agfagkdsg gdsmkgnsa dsgvds nkjg.</Typography></li>
                                            <li><Typography>KPOP fanatik. Tidak perlu dijelaskan.</Typography></li>
                                            <li><Typography>Pornografi. Contoh: foto bokep, kecuali shitposting :)</Typography></li>
                                            <li><Typography>Yang merugikan orang lain. Contoh: Aib seseorang, foto bugil seseorang, dsb.</Typography></li>
                                        </ol>
                                    </li>
                                    <li><Typography>Pengirim tweet tidak akan dibeberkan kecuali merugikan seseorang.</Typography></li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded === 'panel8'} onChange={handleChange('panel8')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel8bh-content"
                            >
                                <Typography variant='h6' component='h4'>Cara Melaporkan Tweet dari @Portalnesia1 Yang Merugikan</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <ul>
                                    <li><Typography>JANGAN REPORT AKUN @Portalnesia1! Karena akan ditindak lanjuti oleh twitter, bukan oleh tim IT Portalnesia.</Typography></li>
                                    <li><Typography>Salin URL tweet yang ingin dilaporkan, DM URL tersebut ke akun <a className="underline" href="https://twitter.com/PutuAditya_SID" target="_blank" rel="noopener noreferrer nofollow">@PutuAditya_SID</a> atau <a className="underline" href="https://portalnesia.com/tw" target="_blank" rel="noopener noreferrer nofollow">@Portalnesia1</a> (Tidak menggunakan kata kunci [PN]).</Typography></li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded === 'panel9'} onChange={handleChange('panel9')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel9bh-content"
                            >
                                <Typography variant='h6' component='h4'>Sanksi</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <Typography gutterBottom>Apabila pengirim tweet ketahuan melanggar atau merugikan, maka:</Typography>
                                <ul>
                                    <li><Typography>Akan ditegur secara private oleh tim IT kami, tetapi masih diperbolehkan mengirim tweet melalui @Portalnesia1</Typography></li>
                                    <li><Typography>Apabila masih melanggar, maka akun tersebut akan kami block.</Typography></li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                    </PaperBlock>
                    <PaperBlock title="Information" linkColor whiteBg>
                        <Accordion expanded={expanded === 'panel10'} onChange={handleChange('panel10')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel10bh-content"
                            >
                                <Typography variant='h6' component='h4'>Penjelasan Pesan Error</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <Typography gutterBottom>Setiap pesan error yang anda terima, maka pesan anda otomatis terhapus dari database kami. Silahkan mengirim ulang pesan anda melalui DM dengan kata kunci <code>[PN]</code>.</Typography>
                                
                                <pre><code>Sorry we cant send your image, please try again later.</code></pre>
                                <Typography gutterBottom>Apabila anda menyisipkan gambar dan muncul error tersebut, kemungkinan sedang terjadi masalah pada internal server twitter.com maupun server kami. Apabila error tersebut terus terjadi, silahkan menghubungi kami <Link href='/contact' passHref><a className="underline">disini</a></Link>.</Typography>
                            
                                <pre><code>Errors, your message has more than 200 characters.</code></pre>
                                <Typography gutterBottom>Pesan yang anda kirim melebihi 200 karakter. Dimana untuk dapat mengirim pesan anda sebagai tweet, kami membatasi tidak boleh melebihi 200 karakter.</Typography>
                    
                                <pre><code>Errors, you have not followed this account.</code></pre>
                                <Typography gutterBottom>Anda belum mem-follow akun @Portalnesia1. Syarat untuk mengirim tweet adalah anda harus mem-follow akun @Portalnesia1.</Typography>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded === 'panel11'} onChange={handleChange('panel11')}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel11bh-content"
                            >
                                <Typography variant='h6' component='h4'>Informasi Tambahan</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{display:'block'}}>
                                <ul>
                                    <li><Typography>Teks yang anda kirim melalui DM, akan diposting setelah 5 menit pesan tersebut kami terima.</Typography></li>
                                    <li><Typography>Apabila tweet belum juga muncul dalam 10 menit, kemungkinan server atau akun kami sedang mengalami limit.</Typography></li>
                                    <li><Typography>Apabila server atau akun kami sedang mengalami limit, maka.... tidak ada yang perlu dikhawatirkan, tweet akan diposting setelah server atau akun kami kembali normal. Tetapi apabila dalam 6 jam tweet belum juga muncul, silahkan mengirim ulang teks melalui DM.</Typography></li>
                                    <li><Typography>Tweet dari akun @Portalnesia1 yang menggunakan kata kunci <code>[PN]</code>, <strong>DITWEET OTOMATIS</strong> sesuai DM (dengan kata kunci) yang kami terima. Kami <strong>TIDAK</strong> bertanggung jawab atas isi tweet tersebut, apabila merugikan sesegera mungkin akan kami hapus.</Typography></li>
                                    <li><Typography>Informasi yang belum diatur dalam website ini, akan ditentukan kemudian.</Typography></li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                    </PaperBlock>
                </Grid>
            </Grid>
        </Header>
    )
}
export default TwitterDocs