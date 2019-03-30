import React, { Component } from'react'
import OrbitDB from 'orbit-db'
import { 
    MDBContainer, MDBRow, MDBCol, MDBBtn,
    MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter,
    MDBInput,
    MDBCard, MDBCardBody, MDBCardTitle, MDBCardText
} from 'mdbreact'
import html2pdf from 'html2pdf.js'
import ipfs from './ipfs'

import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap-css-only/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'

const CUSTOM_CSS_FIELDS = [
    'custom_css_name', 
    'custom_css_user_info', 
    'custom_css_section_title', 
    'custom_css_university_company', 
    'custom_css_course_position',
    'custom_css_date',
    'custom_css_description'
]


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
        cv_history: [],
        custom_css: '',
        mode: 'user-info',

        custom_css_name: {
            color: 'black',
            fontSize: '18px'
        },
        custom_css_user_info: {
            color: 'black',
            fontSize: '18px'
        },
        custom_css_section_title: {
            color: 'black',
            fontSize: '18px'
        },
        custom_css_university_company: {
            color: 'black',
            fontSize: '18px'
        },
        custom_css_course_position: {
            color: 'black',
            fontSize: '18px'
        },
        custom_css_date: {
            color: 'black',
            fontSize: '18px'
        },
        custom_css_description: {
            color: 'black',
            fontSize: '18px'
        },

        custom_css_name_temp: JSON.stringify({
            color: 'black',
            fontSize: '18px'
        }),
        custom_css_user_info_temp: JSON.stringify({
            color: 'black',
            fontSize: '18px'
        }),
        custom_css_section_title_temp: JSON.stringify({
            color: 'black',
            fontSize: '18px'
        }),
        custom_css_university_company_temp: JSON.stringify({
            color: 'black',
            fontSize: '18px'
        }),
        custom_css_course_position_temp: JSON.stringify({
            color: 'black',
            fontSize: '18px'
        }),
        custom_css_date_temp: JSON.stringify({
            color: 'black',
            fontSize: '18px'
        }),
        custom_css_description_temp: JSON.stringify({
            color: 'black',
            fontSize: '18px'
        }),


        errors: []
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
        await this.getUser(public_hex)
    }

    getUser = async (public_hex) => {
        const res = await this.state.db.get(public_hex)
        console.log('getting user with public_hex: ', public_hex)
        console.log(res)
        try {
            if (res[0]._id) {
                await this.setState({ 
                    user_info_name: res[0].data.user_info_name,
                    user_info_email: res[0].data.user_info_email,
                    user_info_address: res[0].data.user_info_address,
                    user_info_phone_number: res[0].data.user_info_phone_number,
                    user_info_education: res[0].data.user_info_education,
                    user_info_experience: res[0].data.user_info_experience,

                    custom_css_name: res[0].data.custom_css_name,
                    custom_css_user_info: res[0].data.custom_css_user_info,
                    custom_css_section_title: res[0].data.custom_css_section_title,
                    custom_css_university_company: res[0].data.custom_css_university_company,
                    custom_css_course_position: res[0].data.custom_css_course_position,
                    custom_css_date: res[0].data.custom_css_date,
                    custom_css_description: res[0].data.custom_css_description,

                    custom_css_name_temp: JSON.stringify(res[0].data.custom_css_name),
                    custom_css_user_info_temp: JSON.stringify(res[0].data.custom_css_user_info),
                    custom_css_section_title_temp: JSON.stringify(res[0].data.custom_css_section_title),
                    custom_css_university_company_temp: JSON.stringify(res[0].data.custom_css_university_company),
                    custom_css_course_position_temp: JSON.stringify(res[0].data.custom_css_course_position),
                    custom_css_date_temp: JSON.stringify(res[0].data.custom_css_date),
                    custom_css_description_temp: JSON.stringify(res[0].data.custom_css_description),

                    cv_history: res[0].data.cv_history
                })
            }
        } catch (err) {
            console.log('err: ', err)
        }
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
        // const uploaded_file = await ipfs.files.add(cv_buffer)
        // console.log('uploaded_file: ', uploaded_file)
        // await this.setState(prevState => ({
        //     cv_history: [...prevState.cv_history, uploaded_file[0]]
        // }))
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

        const { 
            user_info_name, 
            user_info_email, 
            user_info_address, 
            user_info_phone_number, 
            user_info_education, 
            user_info_experience, 

            custom_css_name,
            custom_css_user_info,
            custom_css_section_title,
            
            custom_css_university_company,
            custom_css_course_position,
            custom_css_date,
            custom_css_description,
            
            db, 
            public_hex, 
            cv_history 
        } = this.state
        
        const data = { 
            user_info_name, 
            user_info_email, 
            user_info_address, 
            user_info_phone_number, 
            user_info_education, 
            user_info_experience, 

            custom_css_name,
            custom_css_user_info,
            custom_css_section_title,
            
            custom_css_university_company,
            custom_css_course_position,
            custom_css_date,
            custom_css_description,
            
            cv_history 
        }
        console.log('ALL USER_INFO: ', data)
        await db.put({ _id: public_hex, data })
    }

    onHexcodeChange = async (e) => {
        e.preventDefault()

        this.setState({ public_hex: e.target.value })
        await this.getUser(e.target.value)
    }
    
    deleteEducation = (exp_id) => {
        const { user_info_education } = this.state 
        console.log(this.state.user_info_education)
        const index = user_info_education.findIndex(exp => exp._id === exp_id)
        this.setState(prevState => ({
            user_info_education: [...prevState.user_info_education.slice(0,index), ...prevState.user_info_education.slice(index+1)]
        }))
    }

    deleteExperience = (exp_id) => {
        const { user_info_experience } = this.state 
        console.log(this.state.user_info_experience)
        const index = user_info_experience.findIndex(exp => exp._id === exp_id)
        this.setState(prevState => ({
            user_info_experience: [...prevState.user_info_experience.slice(0,index), ...prevState.user_info_experience.slice(index+1)]
        }))
    }

    handleCustomCSSChange = (e) => {
        console.log('value: ', e.target.value)
        // console.log('asdf: ', JSON.parse(e.target.value), typeof JSON.parse(e.target.value))
        // const new_css = Object.assign({}, JSON.parse(e.target.value))
        let key = `${e.target.id}_temp`

        this.setState({ [key]: e.target.value })
    }

    applyCSSChanges = async () => {
        for (const field of CUSTOM_CSS_FIELDS) {
            try {
                const new_css = JSON.parse(this.state[`${field}_temp`])
                console.log(`new_css for ${field}`, new_css, typeof new_css)
                this.setState({ [field]: new_css })
            } catch (err) {
                console.log('initial erros: ', this.state.errors)
                let errors = this.state.errors.slice()
                let error_field = field.slice(11, field.length)
                error_field = error_field.replace(/_/g, '/')
                console.log('error_field: ', error_field)
                errors.push(error_field)
                errors = [...new Set(errors)]
                console.log('errors: ', errors)
                await this.setState({ errors })
            }
        }
    }
    
    render() {
        const { public_hex } = this.state

        return (
            <MDBContainer>
                <br/>
                <br/>
                <h2 className="h2 mb-4 text-center">Decentralized CVs</h2>
                <MDBRow>
                    <MDBCol>
                        <p>Please save your <strong>hex code</strong> to access your information:</p>
                        <MDBInput value={public_hex} onChange={this.onHexcodeChange}/>
                    </MDBCol>
                </MDBRow>
                
                <MDBRow>
                    <MDBCol>
                        <MDBBtn className="float-left" color="blue" onClick={() => this.setState({ mode: 'user-info'}) }>User Info</MDBBtn>
                        <MDBBtn className="float-left" color="blue" onClick={() => this.setState({ mode: 'custom-css'}) }>Custom CSS</MDBBtn>
                    </MDBCol>
                    <MDBCol>
                        <MDBBtn className="float-right" color="green" onClick={this.handleUploadCVToIPFS}>Save Changes</MDBBtn>
                    </MDBCol>
                </MDBRow>
                <br />
                <br />
                <MDBRow>
                    {this.state.mode === 'user-info' ?
                        <MDBCol>
                            <MDBRow>
                                <MDBCol>
                                    <MDBInput
                                        label="Name"
                                        icon="user"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='user_info_name'
                                        onChange={this.handleOnChange}
                                        value={this.state.user_info_name ? this.state.user_info_name : ''}
                                    />
                                    <MDBInput
                                        label="Email"
                                        icon="envelope"
                                        group
                                        type="email"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='user_info_email'
                                        onChange={this.handleOnChange}
                                        value={this.state.user_info_email ? this.state.user_info_email : ''}
                                    />
                                    <MDBInput
                                        label="Address"
                                        icon="home"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='user_info_address'
                                        onChange={this.handleOnChange}
                                        value={this.state.user_info_address}
                                    />
                                    <MDBInput
                                        label="Phone Number"
                                        icon="phone"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='user_info_phone_number'
                                        onChange={this.handleOnChange}
                                        value={this.state.user_info_phone_number}
                                    />
                                </MDBCol>
                            </MDBRow>
                            <MDBRow>
                                <MDBCol><h1 class="h4 mb-4">Education</h1></MDBCol>
                                <MDBCol><MDBBtn color="primary" size="sm" onClick={() => this.setState({ education_modal: !this.state.education_modal })}>+</MDBBtn></MDBCol>
                            </MDBRow>
                            <div>
                                {this.state.user_info_education.map((e) => {
                                    return (
                                        <MDBCard className="w-75 mb-4">
                                            <MDBCardBody>
                                                <MDBCardTitle>{e.school}<MDBBtn className="float-right" color="danger" size="sm" onClick={() => this.deleteEducation(e._id)}>x</MDBBtn></MDBCardTitle>
                                                <MDBCardText>
                                                    {e.degree} - {e.course}
                                                    <br/>
                                                    {e.education_start_date} - {e.education_end_date}
                                                </MDBCardText>
                                            </MDBCardBody>
                                        </MDBCard>
                                    )
                                })}
                            </div>
                            <br/>
                            <MDBRow>
                                <MDBCol><h1 class="h4 mb-4">Experience</h1></MDBCol>
                                <MDBCol><MDBBtn color="primary" size="sm" onClick={() => this.setState({ experience_modal: !this.state.experience_modal })}>+</MDBBtn></MDBCol>
                            </MDBRow>
                            <div>
                                {this.state.user_info_experience.map((e) => {
                                    return (
                                        <MDBCard className="w-75 mb-4">
                                            <MDBCardBody>
                                                <MDBCardTitle>{e.company}<MDBBtn className="float-right" color="danger" size="sm" onClick={() => this.deleteExperience(e._id)}>x</MDBBtn></MDBCardTitle>
                                                <MDBCardText>
                                                    {e.position}
                                                    <br/>
                                                    {e.experience_start_date} - {e.experience_end_date}
                                                    <br/>
                                                    {e.job_description}
                                                </MDBCardText>
                                            </MDBCardBody>
                                        </MDBCard>
                                    )
                                })}
                            </div>
                        </MDBCol>
                        :
                        <div></div>
                    }
                    {this.state.mode === 'custom-css' ?
                        <MDBCol>
                            <MDBRow>
                                <MDBCol><h1 class="h4 mb-4">Custom CSS</h1></MDBCol>
                            </MDBRow>
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="Name"
                                id='custom_css_name'
                                value={this.state.custom_css_name_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="User Info"
                                id='custom_css_user_info'
                                value={this.state.custom_css_user_info_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="Section Titles"
                                id='custom_css_section_title'
                                value={this.state.custom_css_section_title_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="University and Company Line"
                                id='custom_css_university_company'
                                value={this.state.custom_css_university_company_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="Program / Course and Position Line"
                                id='custom_css_course_position'
                                value={this.state.custom_css_course_position_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="Duration Line"
                                id='custom_css_date'
                                value={this.state.custom_css_date_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="Description"
                                id='custom_css_description'
                                value={this.state.custom_css_description_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            { this.state.errors.length > 0 ? 
                                <p className="float-left" id='fields-error-message'>You have errors in the following fields: {this.state.errors.join(', ')}</p> 
                                : 
                                '' 
                            }
                            <MDBBtn className="float-right" color="blue" onClick={this.applyCSSChanges}>Apply Changes</MDBBtn>
                        </MDBCol>
                        :
                        <div></div>
                    }
                    <MDBCol>
                        <h1 class="h4 mb-4">PDF Preview</h1>
                        <div id='cv-preview'>
                            <MDBContainer>
                                <MDBCard>
                                    <MDBCardBody>
                                        <p style={this.state.custom_css_name}>{this.state.user_info_name}</p>
                                        <div style={this.state.custom_css_user_info}>
                                            <p>{this.state.user_info_address} {this.state.user_info_email} {this.state.user_info_phone_number} </p>
                                        </div>
                                        <p style={this.state.custom_css_section_title}>Education</p>
                                        {this.state.user_info_education.map((e) => {
                                            return (
                                                <div id='education-container'>
                                                    <p id='education-school-name' style={this.state.custom_css_university_company}>{e.school}</p>
                                                    <p id='education-degree-course' style={this.state.custom_css_course_position}>{e.degree} - {e.course}</p>
                                                    <p id='education-dates' style={this.state.custom_css_date}>{e.education_start_date} - {e.education_end_date}</p>
                                                    <br />
                                                </div>
                                            )
                                        })}
                                        <p id='section-title' style={this.state.custom_css_section_title}>Experience</p>
                                        {this.state.user_info_experience.map((e) => {
                                            return (
                                                <div id='experience-container'>
                                                    <p id='experience-company' style={this.state.custom_css_university_company}>{e.company}</p>
                                                    <p id='experience-position' style={this.state.custom_css_course_position}>{e.position}</p>
                                                    <p id='experience-dates' style={this.state.custom_css_date}>{e.experience_start_date} - {e.experience_end_date}</p>
                                                    <p id='experience-description' style={this.state.custom_css_description}>{e.job_description}</p>
                                                    <br />
                                                </div>
                                            )
                                        })}
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBContainer>
                        </div>
                        <br/><br/>
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
    }
}

export default App 
