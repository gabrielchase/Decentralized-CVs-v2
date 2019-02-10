import React, { Component } from'react'
import OrbitDB from 'orbit-db'
import { 
    MDBContainer, MDBRow, MDBCol, MDBBtn,
    MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter,
    MDBInput,
    MDBCard, MDBCardBody
} from 'mdbreact'
import html2pdf from 'html2pdf.js'
import ipfs from './ipfs'

import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap-css-only/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'




class App extends Component {
    state = {
        orbitdb: null,
        db: null, 
        public_hex: null,
        education: '',
        user_info_name: '',
        user_info_address: '',
        user_info_email: '',
        user_info_phone_number: '',
        user_info_education: [],
        user_info_experience: [],
        loading: false,
        education_modal: false,
        experience_modal: false,
        cv_history: []
    }

    // constructor(props) {
    async componentWillMount() {
        // super(props)
        console.log('hi')
    
        // ipfs.on('ready', async () => {
        console.log('ipfs ready: ', ipfs)

        //Create OrbitDB instance
        const orbitdb = new OrbitDB(ipfs)
        console.log('orbitdb ready')

        const public_hex = orbitdb.key.getPublic('hex')
        console.log('public_hex: ', public_hex)
        const access = {
            // Give write access to ourselves
            write: [public_hex],
        }
    
        const db = await orbitdb.docstore('decentralized-cvs', access)
        await db.load()
        console.log('db address', db.address.toString())
        
        //store ipfs and orbitdb in state
        this.setState({
            orbitdb,
            db,
            public_hex
        })
        
        const res = await db.get(public_hex)
        console.log('componentWillMount', res)
        // const 
        if (res[0]._id) {
            await this.setState({ 
                user_info_name: res[0].data.user_info_name,
                user_info_email: res[0].data.user_info_email,
                user_info_education: res[0].data.user_info_education,
                user_info_experience: res[0].data.user_info_experience,
                cv_history: res[0].data.cv_history
            })
        }
            
                // console.log('new state: ', this.state)
        // })
    }

    handleOnChange = (e) => {
        e.preventDefault()

        this.setState({ [e.target.id]: e.target.value })
    }

    handleAddEducation = async () => {
        const { school, degree, course, education_start_date, education_end_date } = this.state 

        const education_data = {
            school,
            degree,
            course,
            education_start_date,
            education_end_date
        }
        console.log(education_data)
        this.setState(prevState => ({
            user_info_education: [...prevState.user_info_education, education_data]
        }))
        this.setState({ education_modal: !this.state.education_modal })
        console.log(this.state.user_info_education)
    }

    handleAddExperience = async () => {
        const { company, position, experience_start_date, experience_end_date, job_description } = this.state 
        const experience_data = {
            company, 
            position, 
            experience_start_date, 
            experience_end_date, 
            job_description
        }
        this.setState(prevState => ({
            user_info_experience: [...prevState.user_info_experience, experience_data]
        }))
        this.setState({ experience_modal: !this.state.experience_modal })
        console.log(this.state.user_info_experience)
    }

    handleUploadCVToIPFS = async () => {
        const cv = document.getElementById('cv-preview')
        const pdf_output = await html2pdf().from(cv).outputPdf()
        const cv_buffer = Buffer.from(pdf_output, 'binary')
        const uploaded_file = await ipfs.files.add(cv_buffer)
        console.log('uploaded_file: ', uploaded_file)
        await this.setState(prevState => ({
            cv_history: [...prevState.cv_history, uploaded_file[0]]
        }))
        let today = new Date()
        let dd = today.getDate()
        let mm = today.getMonth() + 1
        let yyyy = today.getFullYear()

        if (dd < 10) 
            dd = '0' + dd

        if (mm < 10) 
            mm = '0' + mm

        today = `${mm}-${dd}-${yyyy}`
        const filename = `${this.state.user_info_name}_${today}`

        html2pdf(cv, { filename })

        const { user_info_name, user_info_email, user_info_education, user_info_experience, db, public_hex, cv_history } = this.state
        
        const data = { user_info_name, user_info_email, user_info_education, user_info_experience, cv_history }
        console.log('ALL USER_INFO: ', data)
        await db.put({ _id: public_hex, data })
    }
    
    render() {
        const { public_hex } = this.state

        if (this.state.user_info_name) {
        return (
          <MDBContainer>
            <h2>Decentralized CVs</h2>
            <p>Your public hex code: {public_hex}</p>
            <MDBBtn color="green" onClick={this.handleUploadCVToIPFS}>Save Changes</MDBBtn>
            <MDBRow>
                <MDBCol>
                    <MDBInput
                        label="Your name"
                        icon="user"
                        group
                        type="text"
                        validate
                        error="wrong"
                        success="right"
                        id='user_info_name'
                        onChange={this.handleOnChange}
                        value={this.state.user_info_name}
                    />
                    <MDBInput
                        label="Your email"
                        icon="envelope"
                        group
                        type="email"
                        validate
                        error="wrong"
                        success="right"
                        id='user_info_email'
                        onChange={this.handleOnChange}
                        value={this.state.user_info_email}
                    />
                    <MDBRow>
                        <MDBCol><h1 class="h4 mb-4">Education</h1></MDBCol>
                        <MDBCol><MDBBtn color="primary" onClick={() => this.setState({ education_modal: !this.state.education_modal })}>+</MDBBtn></MDBCol>
                    </MDBRow>
                    {this.state.user_info_education.map((e) => {
                        return (
                            <div>
                                <p>{e.school}</p>
                                <p>{e.degree} - {e.course}</p>
                                <p>{e.education_start_date} - {e.education_end_date}</p>
                                <br />
                            </div>
                        )
                    })}
                    <MDBRow>
                        <MDBCol><h1 class="h4 mb-4">Experience</h1></MDBCol>
                        <MDBCol><MDBBtn color="primary" onClick={() => this.setState({ experience_modal: !this.state.experience_modal })}>+</MDBBtn></MDBCol>
                    </MDBRow>
                    {this.state.user_info_experience.map((e) => {
                        return (
                            <div>
                                <p>{e.company}</p>
                                <p>{e.position}</p>
                                <p>{e.experience_start_date} - {e.experience_end_date}</p>
                                <p>{e.job_description}</p>
                                <br />
                            </div>
                        )
                    })}
                </MDBCol>
                <br />
                <br />
                <MDBCol>
                    <h1>PDF PREVIEW</h1>
                    <div id='cv-preview'>
                        <MDBContainer>
                            <MDBCard>
                                <MDBCardBody>
                                    <h1>{this.state.user_info_name}</h1>
                                    <h1>{this.state.user_info_email}</h1>
                                    <h1>Education</h1>
                                    {this.state.user_info_education.map((e) => {
                                        return (
                                            <div>
                                                <p>{e.school}</p>
                                                <p>{e.degree} - {e.course}</p>
                                                <p>{e.education_start_date} - {e.education_end_date}</p>
                                                <br />
                                            </div>
                                        )
                                    })}
                                    <h1>Experience</h1>
                                    {this.state.user_info_experience.map((e) => {
                                        return (
                                            <div>
                                                <p>{e.company}</p>
                                                <p>{e.position}</p>
                                                <p>{e.experience_start_date} - {e.experience_end_date}</p>
                                                <p>{e.job_description}</p>
                                                <br />
                                            </div>
                                        )
                                    })}
                                </MDBCardBody>
                            </MDBCard>
                        </MDBContainer>
                    </div>
                </MDBCol>
            </MDBRow>

            <MDBModal isOpen={this.state.education_modal} toggle={() => this.setState({ education_modal: !this.state.education_modal })} centered>
                <MDBModalHeader toggle={() => this.setState({ education_modal: !this.state.education_modal })}>Add Education</MDBModalHeader>
                <MDBModalBody>
                    <MDBContainer>
                        <form>
                            <div className="grey-text">
                                <MDBInput
                                    label="School"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='school'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Degree"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='degree'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Course"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='course'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Start Year-Month"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='education_start_date'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Graduation Year-Month"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='education_end_date'
                                    onChange={this.handleOnChange}
                                />
                            </div>
                        </form>
                    </MDBContainer>
                </MDBModalBody>
                <MDBModalFooter>
                    <MDBBtn color="secondary" onClick={() => this.setState({ education_modal: !this.state.education_modal })}>Close</MDBBtn>
                    <MDBBtn color="primary" onClick={this.handleAddEducation}>Add</MDBBtn>
                </MDBModalFooter>
            </MDBModal>
            <MDBModal isOpen={this.state.experience_modal} toggle={() => this.setState({ experience_modal: !this.state.experience_modal })} centered>
                <MDBModalHeader toggle={() => this.setState({ experience_modal: !this.state.experience_modal })}>Add Experience</MDBModalHeader>
                <MDBModalBody>
                    <MDBContainer>
                        <form>
                            <div className="grey-text">
                                <MDBInput
                                    label="Company"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='company'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Position"
                                    group
                                    type="email"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='position'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Start Month and Year"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='experience_start_date'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="End Month and Year"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='experience_end_date'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    type="textarea"
                                    rows="3"
                                    label="Job Description"
                                    id='job_description'
                                    onChange={this.handleOnChange}
                                />
                            </div>
                        </form>
                    </MDBContainer>
                </MDBModalBody>
                <MDBModalFooter>
                    <MDBBtn color="secondary" onClick={() => this.setState({ experience_modal: !this.state.experience_modal })}>Close</MDBBtn>
                    <MDBBtn color="primary" onClick={this.handleAddExperience}>Add</MDBBtn>
                </MDBModalFooter>
            </MDBModal>
          </MDBContainer>
        )
        } else {
            return <div>Loading...</div>
        } 
    }
}

export default App 
